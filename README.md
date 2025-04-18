
# Web Article Whisperer

A lightweight, web-based Python app that lets users paste a URL, and get a clean, section-by-section summary in their browser. Powered by BeautifulSoup for scraping and Hugging Face's Transformers for open-source summarization - running entirely locally, no external API keys required.

## Features

- **URL-based Article Summarization**: Simply paste any article URL and get a summary
- **Section-by-Section Analysis**: Summaries are organized by article headings
- **Local Processing**: All summarization happens on your device - no data sent to external APIs
- **Markdown Export**: Download summaries as Markdown files
- **GPU Acceleration**: Automatically uses GPU if available for faster processing

## Technical Stack

### Backend
- Flask for the API server
- BeautifulSoup4 for HTML parsing 
- Hugging Face Transformers for summarization
- Bleach for HTML sanitization

### Frontend
- React with TypeScript
- Modern responsive design

## Setup & Installation

### Backend

1. Navigate to the `api` directory:
   ```
   cd api
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```
   python app.py
   ```
   The API will be available at http://localhost:5000

### Frontend

1. In the project root, install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   The app will be available at http://localhost:8080

## Optional Configuration

You can customize the application by creating a `.env` file in the `api` directory with the following variables:

```
SUMMARIZER_MODEL=facebook/bart-large-cnn  # Change to any Hugging Face summarization model
PORT=5000  # Change the API port if needed
```

## Usage

1. Open the application in your browser
2. Paste an article URL into the input field
3. Click "Summarize" and wait for the processing to complete
4. Review the section-by-section summaries
5. Optionally download the summaries as a Markdown file

## Error Handling

The application includes robust error handling for:
- Invalid URLs
- Failed article fetching
- HTML parsing issues
- Summarization errors

## Limitations

- Some complex page layouts may not be parsed correctly
- Very long articles may take significant time to process
- Summarization quality depends on the underlying model
