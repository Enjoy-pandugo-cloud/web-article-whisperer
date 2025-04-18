import os
import logging
import json
import re
import requests
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from bs4 import BeautifulSoup
import bleach
import torch
from transformers import pipeline
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Cache for storing summaries
summary_cache = {}

# Check if GPU is available
device = 0 if torch.cuda.is_available() else -1
logger.info(f"Using device: {'GPU' if device == 0 else 'CPU'}")

# Initialize the summarization pipeline
summarizer = None

@app.before_request
def initialize_model():
    global summarizer
    if summarizer is None:
        model_name = os.getenv('SUMMARIZER_MODEL', 'facebook/bart-large-cnn')
        try:
            summarizer = pipeline(
                "summarization",
                model=model_name,
                device=device
            )
            logger.info(f"Model {model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")

def validate_url(url):
    """Validate URL format"""
    pattern = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return bool(pattern.match(url))

def fetch_article(url):
    """Fetch article content from URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.error(f"Error fetching URL {url}: {str(e)}")
        return None

def parse_article(html_content):
    """Parse article content and extract sections"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Try to get the article title
    title = soup.title.string if soup.title else "Article Summary"
    
    # Find all headings and corresponding paragraphs
    headings = soup.find_all(['h1', 'h2', 'h3'])
    sections = []
    
    for i, heading in enumerate(headings):
        heading_text = heading.get_text().strip()
        if not heading_text:
            continue
            
        # Get all elements after this heading and before the next heading
        content = []
        next_element = heading.next_sibling
        next_heading_found = False
        
        while next_element and not next_heading_found:
            if next_element.name in ['h1', 'h2', 'h3']:
                next_heading_found = True
            elif next_element.name == 'p':
                paragraph_text = next_element.get_text().strip()
                if paragraph_text:
                    content.append(paragraph_text)
            next_element = next_element.next_sibling
        
        if content:
            sections.append({
                'heading': bleach.clean(heading_text),
                'content': ' '.join([bleach.clean(p) for p in content])
            })
    
    # If no sections were found, try to extract main content paragraphs
    if not sections:
        paragraphs = soup.find_all('p')
        content = ' '.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        if content:
            sections.append({
                'heading': 'Main Content',
                'content': bleach.clean(content)
            })
    
    return {
        'title': bleach.clean(title),
        'sections': sections
    }

def chunk_text(text, max_tokens=1000):
    """Split text into chunks of approximately max_tokens"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        if current_length + len(word.split()) > max_tokens:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_length = len(word.split())
        else:
            current_chunk.append(word)
            current_length += len(word.split())
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def summarize_text(text):
    """Summarize text using the Hugging Face model"""
    if not summarizer:
        return "Summarization model not loaded. Please try again later."
    
    if not text or len(text.strip()) < 100:
        return text
    
    try:
        # If text is too long, chunk it and summarize each chunk
        chunks = chunk_text(text)
        summaries = []
        
        for chunk in chunks:
            if len(chunk.strip()) < 100:
                summaries.append(chunk)
                continue
                
            summary = summarizer(
                chunk, 
                max_length=200, 
                min_length=50, 
                do_sample=False
            )[0]["summary_text"]
            
            summaries.append(summary)
        
        return " ".join(summaries)
    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        return f"Error during summarization: {str(e)}"

@app.route('/api/summarize', methods=['POST'])
def summarize_article():
    # Add CORS headers to allow requests from any origin
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    data = request.json
    url = data.get('url', '')
    
    # Validate URL
    if not url or not validate_url(url):
        return jsonify({'error': 'Invalid URL format'}), 400
    
    # Check cache
    cache_key = url
    if cache_key in summary_cache:
        logger.info(f"Returning cached summary for {url}")
        return jsonify(summary_cache[cache_key])
    
    # Fetch article
    try:
        html_content = fetch_article(url)
        if not html_content:
            return jsonify({'error': 'Failed to fetch article content'}), 400
    except Exception as e:
        logger.error(f"Error fetching article: {str(e)}")
        return jsonify({'error': f'Error fetching article: {str(e)}'}), 500
    
    # Parse article
    try:
        article_data = parse_article(html_content)
    except Exception as e:
        logger.error(f"Error parsing article: {str(e)}")
        return jsonify({'error': f'Error parsing article: {str(e)}'}), 500
    
    # Check if we have any sections to summarize
    if not article_data['sections']:
        return jsonify({'error': 'No content found to summarize in the article'}), 400
    
    # Summarize each section
    summaries = []
    for section in article_data['sections']:
        heading = section['heading']
        content = section['content']
        
        # Skip sections with very little content
        if len(content.split()) < 50:
            continue
            
        try:
            summary = summarize_text(content)
            summaries.append({
                'heading': heading,
                'summary': summary
            })
        except Exception as e:
            logger.error(f"Error summarizing section '{heading}': {str(e)}")
            # Continue with other sections if one fails
    
    # Check if we have any summaries
    if not summaries:
        return jsonify({'error': 'Could not generate summaries from the article content'}), 400
    
    result = {
        'title': article_data['title'],
        'url': url,
        'summaries': summaries
    }
    
    # Cache result
    summary_cache[cache_key] = result
    
    return jsonify(result)

@app.route('/api/download', methods=['POST'])
def download_markdown():
    data = request.json
    title = data.get('title', 'Article Summary')
    summaries = data.get('summaries', [])
    
    # Generate markdown content
    markdown = f"# {title}\n\n"
    
    for section in summaries:
        markdown += f"## {section['heading']}\n\n{section['summary']}\n\n"
    
    # Create response with markdown content
    response = make_response(markdown)
    response.headers['Content-Type'] = 'text/markdown'
    response.headers['Content-Disposition'] = f'attachment; filename="{title.replace(" ", "_")}.md"'
    
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'gpu': torch.cuda.is_available()})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Set debug=False in production
    debug_mode = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
