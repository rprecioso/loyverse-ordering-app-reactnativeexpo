import { loyverseAPI } from "@/lib/api/loyverse";

export async function GET(request: Request) {
    try {
        const categories = await loyverseAPI.getCategories();
        return Response.json(categories);
    } catch (error) {
        console.error('Error fetching items:', error);
        return Response.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}