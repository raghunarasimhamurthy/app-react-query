import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from "./Sendpost.module.css";


const fetchPosts = async () => {
    const res = await fetch("http://localhost:4000/posts");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

const addPost = async (newPost: { title: string, body: string }) => {
    
    const res = await fetch("http://localhost:4000/posts",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newPost)
        });
        

    const data = await res.json();
    console.log("API Response:", data); // Debugging
    if (!res.ok) throw new Error("Failed to create post");

    return data;
}

export default function Sendpost() {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
        
       
    });

    const mutation = useMutation({
        mutationKey: ["addPost"],  // ✅ Add a unique key
        mutationFn: addPost,
        onSuccess: (data) => {
            console.log("Post added:", data);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError:(error) => {
            console.error("Error adding post:", error);
        }
    })

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ title, body });
        setTitle("");
        setBody("");
    }

    if (isLoading) return <p>Loading posts...</p>;
    if (error) return <p>Error G: {error.message}</p>;
   
    return (
        <div>
            <h1>POSTS</h1>
            <ul className={styles.box}>
                {
                    data.map((post: { id: number, title: string }) => (
                        <li key={post.id}>{post.title}</li>
                    ))
                }
            </ul>

            <h1>Add Post</h1>
            <ul>
                <form onSubmit={handleSubmit}>
                    <br/>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                    <br/>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
                    <br/>
                    <button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Adding..." : "Add Post"}
                    </button>
                    {mutation.isError && <p>Error: {mutation.error.message}</p>}
                </form>
            </ul>
        </div>
    )
}
