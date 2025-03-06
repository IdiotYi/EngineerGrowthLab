from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
from typing import Literal
from anthropic import Anthropic
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
]

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 初始化 Anthropic 客户端
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# 添加根路由
@app.get("/")
async def root():
    return {"message": "Engineer Growth Lab API"}

class ChatMessage(BaseModel):
    message: str
    model: Literal["deepseek-r1:1.5b", "claude-3-haiku"]

@app.options("/chat")
async def chat_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )

async def call_ollama(message: str, model: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": message,
                "stream": False
            },
            timeout=30.0
        )
        response.raise_for_status()
        return response.json()["response"]

def call_claude(message: str) -> str:
    try:
        system_prompt = "You are Engineer Growth Lab Agent, a helpful AI assistant focused on software engineering and technical topics. Please provide clear, accurate, and professional responses."
        
        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": message
                }
            ]
        )
        return response.content[0].text
    except Exception as e:
        print(f"Claude API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Claude API error: {str(e)}")

@app.post("/chat")
async def chat(message: ChatMessage):
    print(f"Received message: {message.message}")
    print(f"Selected model: {message.model}")
    
    try:
        if message.model == "deepseek-r1:1.5b":
            response_text = await call_ollama(message.message, message.model)
        elif message.model == "claude-3-haiku":
            response_text = call_claude(message.message)
        else:
            raise HTTPException(status_code=400, detail="Unsupported model")
        
        return {"response": response_text}
            
    except httpx.ConnectError:
        print("Connection error to model service")
        raise HTTPException(status_code=503, detail="无法连接到模型服务。请确保服务正在运行。")
    except httpx.TimeoutException:
        print("Request timeout")
        raise HTTPException(status_code=504, detail="请求超时。请检查模型服务是否响应正常。")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 