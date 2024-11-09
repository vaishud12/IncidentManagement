from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from bs4 import BeautifulSoup
import re
import requests
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from QuantileClient import QuantileClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the origin of your React app
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Add OPTIONS method
    allow_headers=["*"],
)

# Initialize QuantileClient
base_url = "http://77.37.47.33:8000"  # Adjust to your server's base URL
api_key = "quant-3rzCLlkmjyamQWB4oW1jF"
client = QuantileClient(base_url, api_key)


class Prompt(BaseModel):
    prompt: str
    max_tokens: int


@app.post("/generate/")
async def generate_text(prompt_data: Prompt):
    prompt = prompt_data.prompt
    max_tokens = prompt_data.max_tokens

    # Make the call to QuantileClient
    callcascade = client.call_cascading(prompt=prompt, max_tokens=max_tokens)
    
    # Check if 'generated_text' key exists in the response
    if 'generated_text' in callcascade:
        return {"generated_text": callcascade['generated_text']}
    else:
        raise HTTPException(status_code=500, detail="Failed to generate text.")

def fetch_html(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching HTML: {e}")
        return None

def extract_meta_data(html):
    meta_data = {}
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        meta_tags = soup.find_all('meta')
        for tag in meta_tags:
            if tag.get('name'):
                meta_data[tag.get('name').lower()] = tag.get('content')
            elif tag.get('property') and tag.get('property').lower() != 'og:locale':
                meta_data[tag.get('property').lower()] = tag.get('content')
    return meta_data

def extract_keywords(description):
    keywords = re.findall(r'\b[A-Za-z]+\b', description)
    return list(set(keywords))

def scrape_content(html):
    content = ""
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            content += p.get_text() + " "
    return content

def generate_keywords(content):
    keywords = re.findall(r'\b\w{4,}\b', content)
    return list(set(keywords))

def analyze_meta_data(meta_data, description_keywords, content_keywords):
    recommendations = []
    
    if 'description' not in meta_data:
        recommendations.append({
            "recommendation": "Add a meta description tag to provide a brief summary of the page.",
            "example_keywords": []
        })
    
    if 'title' in meta_data and len(meta_data['title']) < 10:
        recommendations.append({
            "recommendation": "Consider making the page title longer for better search engine visibility.",
            "example_keywords": []
        })
    
    recommendations.append({
        "recommendation": "Keywords extracted from the description:",
        "example_keywords": description_keywords
    })
    
    recommendations.append({
        "recommendation": "Keywords extracted from the content:",
        "example_keywords": content_keywords
    })
    
    return recommendations

# Function to analyze SEO using a different API
def analyze_seo_data(url, description):
    # Placeholder SEO analysis logic
    # You can replace this with your actual SEO analysis code
    
    # Extract meta data from the provided URL
    meta_data = {
        "title": "Sample Title",
        "description": "Sample Description",
        "keywords": ["sample", "keywords", "for", "SEO"]
    }
    
    # Generate recommendations based on the extracted meta data and description
    recommendations = []
    
    # Check if the meta description is missing
    if "description" not in meta_data:
        recommendations.append({
            "recommendation": "Add a meta description tag to provide a brief summary of the page.",
            "example_keywords": []
        })
    
    # Check if the title length is insufficient
    if "title" in meta_data and len(meta_data["title"]) < 10:
        recommendations.append({
            "recommendation": "Consider making the page title longer for better search engine visibility.",
            "example_keywords": []
        })
    
    # Include example keywords extracted from the description and content
    recommendations.append({
        "recommendation": "Keywords extracted from the description:",
        "example_keywords": meta_data["keywords"]
    })
    
    # SEO meta data
    seo_meta_data = {
        "seo_title": meta_data["title"],
        "seo_description": meta_data["description"],
        "seo_keywords": meta_data["keywords"]
    }
    
    return recommendations, seo_meta_data

@app.post("/analyze")
async def analyze_page(description: str = Form(...), url: str = Form(...)):
    html = fetch_html(url)
    if html:
        meta_data = extract_meta_data(html)
        description_keywords = extract_keywords(description)
        content = scrape_content(html)
        content_keywords = generate_keywords(content)
        recommendations = analyze_meta_data(meta_data, description_keywords, content_keywords)
        
        results = {
            "meta_data": meta_data,
            "recommendations": recommendations
        }
        return results
    else:
        return JSONResponse(status_code=404, content={"message": "Failed to fetch HTML from the provided URL."})

@app.post("/analyze-with-api")
async def analyze_page_with_api(description: str = Form(...), url: str = Form(...)):
    # Call another API for SEO analysis
    analysis_results = analyze_seo_data(url, description)
    seo_recommendations, seo_meta_data = analysis_results
    response = {"seo_recommendations": seo_recommendations, "seo_meta_data": seo_meta_data}
    return JSONResponse(content=response, status_code=200, headers={"Access-Control-Allow-Origin": "*"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
