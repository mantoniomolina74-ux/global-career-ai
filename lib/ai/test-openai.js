
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

async function test() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Responde solo: AI conectado correctamente",
        },
      ],
    });

    console.log("\n🧠 RESPUESTA IA:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error("\n❌ ERROR OPENAI:");
    console.error(err);
  }
}

test();