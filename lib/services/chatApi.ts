// lib/services/chatApi.ts
export async function listConversations() {
    const r = await fetch("/api/conversations", { cache: "no-store" });
    return r.json(); // { conversations: [...] }
  }
  
  export async function createConversation(title?: string) {
    const r = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    return r.json(); // { conversation }
  }
  
  export async function listMessages(conversationId: string) {
    const r = await fetch(`/api/messages/${conversationId}`, { cache: "no-store" });
    return r.json(); // { messages: [...] }
  }
  
  export async function addMessage(conversationId: string, role: "user" | "bot", text: string) {
    const r = await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, role, text }),
    });
    return r.json(); // { message }
  }
  