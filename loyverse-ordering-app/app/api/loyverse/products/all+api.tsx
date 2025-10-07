import { loyverseAPI } from "@/lib/api/loyverse";

export async function GET(request: Request) {
    try {
        const data = await loyverseAPI.getProducts();  
        return Response.json(data.products);
    } catch (error) {
        console.error('Error fetching data:', error);
        return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}