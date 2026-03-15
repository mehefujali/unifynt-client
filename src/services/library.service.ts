import api from "@/lib/axios";

export interface IBookCopy {
    id?: string;
    accessionNumber: string;
    rackLocation?: string;
    status?: "AVAILABLE" | "ISSUED" | "LOST" | "DAMAGED";
}

export interface ILibraryBook {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    edition?: string;
    category?: string;
    description?: string;
    coverImage?: string;
    copies: IBookCopy[];
    _count?: {
        copies: number;
    };
}

export const LibraryService = {
    async lookupISBN(isbn: string) {
        const response = await api.get(`/library/lookup/${isbn}`);
        return response.data.data;
    },

    async createBook(data: Partial<ILibraryBook>) {
        const response = await api.post("/library/books", data);
        return response.data;
    },

    async getBooks(searchTerm?: string) {
        const response = await api.get("/library/books", {
            params: { searchTerm },
        });
        return response.data;
    },

    async issueBook(data: { memberId: string; accessionNumber: string; dueDate: string; notes?: string }) {
        const response = await api.post("/library/issue", data);
        return response.data;
    },

    async returnBook(issueId: string) {
        const response = await api.patch(`/library/return/${issueId}`);
        return response.data;
    },

    async getMemberDetails(memberId: string) {
        const response = await api.get(`/library/members/${memberId}`);
        return response.data.data;
    },

    async getStats() {
        const response = await api.get("/library/stats");
        return response.data.data;
    }
};
