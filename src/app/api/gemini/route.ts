import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-2.5-flash for speed. Configuring it to strictly return JSON.
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "API Key is missing. Check your .env file." },
                { status: 500 }
            );
        }

        let prompt = "";

        if (action === "generate_examples") {
            prompt = `
            You are an expert in 'First Principles Thinking' (제1원칙 사고).
            Generate a JSON array of 3 distinct, common everyday problems or life/work bottlenecks that modern professionals experience.
            Return ONLY a valid JSON array of strings in Korean. 
            Example format: ["회의가 너무 많아 업무 시간이 부족하다", "연봉 인상률이 물가를 못 따라간다", "항상 피곤하고 무기력하다"]
            Keep them under 25 characters each.
            `;
        }

        else if (action === "analyze_root_cause") {
            const { problem, chatHistory } = payload;

            // To truly emulate the 5-Whys, we give the AI up to 5 Q&A turns (10 items in chatHistory)
            // It can conclude earlier if it finds the absolute root cause.
            const forceConclusion = chatHistory.length >= 10;

            prompt = `
            You are a brilliant but warm and empathetic First Principles psychological coach.
            The user had this initial problem/desire: "${problem}"
            Here is the conversation history so far:
            ${JSON.stringify(chatHistory, null, 2)}
            
            Your goal is to gently guide the user to find the absolute fundamental Root Cause (Core Truth) by asking 'Why?'. 
            Do NOT ask repetitive "what desire is underneath this" questions. Be insightful, understanding, and gently probe deeper.
            
            [CRITICAL: TONE AND LANGUAGE]
            - ALWAYS speak in a highly accessible, conversational, and natural tone.
            - Be warm, encouraging, and use light-hearted, friendly humor to make the user feel comfortable. Avoid being aggressive or overly sarcastic.
            - Do NOT use difficult psychological jargon, philosophical words, or overly stiff/formal sentences.
            - Ask questions like a close, smart, and caring friend would. (Good: "솔직히 조금 귀찮았던 거 아니에요? 😆 왜 그렇게 눈치를 보게 되었을까요?", Bad: "타인의 시선에 종속된 내면의 근원적 불안은 무엇인가요?", Aggressive: "핑계 대지 말고 진짜 이유를 말해보세요.")
            
            ${forceConclusion ? `
            [CRITICAL INSTRUCTION]: You have asked 5 questions. We have reached the final "5th Why". You MUST now synthesize the conversation and declare the fundamental root cause. Set "isRootCauseFound" to true, and provide the "coreTruth" in an easy-to-understand way.
            ` : `
            Based on the history, if you've ALREADY discovered the undeniable physical or psychological base layer before reaching 5 whys, you CAN set "isRootCauseFound" to true and provide the "coreTruth" now.
            If you need to dig deeper (you haven't found the absolute core yet):
            1. Ask a sharp, reality-checking "Why?" or "So what?" question to break their last statement. Write it conversationally and simply.
            2. Provide 3-4 raw, honest, colloquial options the user might feel.
            `}
            
            Return ONLY a valid JSON object in Korean:
            {
                "isRootCauseFound": boolean,
                "nextQuestion": "Your next piercing question (only if isRootCauseFound is false)",
                "options": [
                    {
                        "text": "A raw, honest answer option (under 35 chars)",
                        "reason": "AI insight explaining why they feel this (under 50 chars)"
                    }
                ],
                "coreTruth": "The harsh but liberating fundamental truth of their situation (1-2 sentences, ONLY if isRootCauseFound is true)"
            }
            `;
        }



        else if (action === "suggest_solutions") {
            const { coreTruths } = payload;
            prompt = `
            You are a pragmatic and innovative problem solver. 
            Based purely on these undeniable physical/fundamental truths: ${JSON.stringify(coreTruths)}
            
            Ignore conventional wisdom. Generate 2 highly effective, fundamental, and practical solutions that directly leverage these core truths to solve the underlying problem. 
            
            Return ONLY a valid JSON array of strings in Korean.
            Example format: [
                "의미 없는 대면 회의를 취소하고 핵심만 담은 1페이지 문서로 대체하기", 
                "반복되는 수작업을 자동화 툴로 넘기고 가장 중요한 기획에만 집중하기"
            ]
            Make the solutions actionable, realistic, and highly direct for an ordinary professional.
            `;
        }

        else if (action === "generate_action_plan") {
            const { solution } = payload;
            prompt = `
            You are a practical and encouraging coach. The user has arrived at this fundamental solution via First Principles Thinking: "${solution}"
            
            Provide an immediate, realistic, and actionable execution plan.
            Return ONLY a valid JSON object in Korean with the following structure:
            {
                "timeframe_1h": "당장 1시간 내로 시작할 수 있는 아주 작은 행동 1가지 (20자 이내)",
                "timeframe_1w": "이번 주 안에 달성할 수 있는 현실적인 마일스톤 1가지 (20자 이내)",
                "mindset_shift": "이 목표를 꾸준히 실행하기 위해 필요한 현실적이고 긍정적인 마인드셋 1문장 (30자 이내)",
                "recommended_activity": "이 해결책을 실천하기 위해 필요한 구체적이고 실질적인 추천 활동 (예: 산책하기, 명상하기, 특정 책 읽기 등) (20자 이내)"
            }
            `;
        }
        else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Since we enforced responseMimeType: "application/json", the text should be a JSON string
        try {
            const parsed = JSON.parse(text);
            return NextResponse.json({ result: parsed });
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", text);
            return NextResponse.json({ error: "AI response was not valid JSON", raw: text }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to process AI request.", details: error.message },
            { status: 500 }
        );
    }
}
