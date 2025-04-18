
#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Ensure Python environment is ready
echo "Setting up Python environment..."

# Install dependencies
pip install -r requirements.txt

# Check if model is downloaded
python -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; AutoTokenizer.from_pretrained('facebook/bart-large-cnn'); AutoModelForSeq2SeqLM.from_pretrained('facebook/bart-large-cnn')"

# Start the Flask server with proper CORS configuration
echo "Starting Flask server..."
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
