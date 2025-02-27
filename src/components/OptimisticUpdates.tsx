import React , {  useState }from "react";
import { useQueryClient ,useMutation, useQuery } from "@tanstack/react-query"


const fetchPosts = async() => {
    const res = await fetch("http://localhost:4000/posts");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
}

const addPosts = async(newPost:{title:string, body:string}) =>{
    const res = await fetch("http://localhost:4000/posts",
        {
            method:"POST",
            headers:{
                "content-type":"application/json",
            },
            body:JSON.stringify(newPost),
        }
    )
    const data = await res.json();
    if(!res.ok) throw new Error("Failed to add");
    return data;
}


function OptimisticPost(){
    const queryClient = useQueryClient();
    const { data, isLoading, error} = useQuery({
        queryKey:["posts"],
        queryFn:fetchPosts,
    })

    const mutation = useMutation({
        mutationFn:addPosts,
        mutationKey:["posts"],
        onMutate:async(newPost:{title:string, body:string}) => {
            await queryClient.cancelQueries({ queryKey:["posts"]});
            const previousPost = queryClient.getQueryData(["posts"]);
            queryClient.setQueryData(["posts"], (old:any)=>[
                { id: Date.now(), ...newPost }, // Fake post in UI
                ...old,
            ]);
            return { previousPost} 
        },
        onError:(_error,_newPost,context)=>{
            if(context?.previousPost){
                queryClient.setQueryData(["posts"],context?.previousPost);
            }
        },
        onSettled:()=>{
            queryClient.refetchQueries({ queryKey:["posts"] });
        }
    })

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({title,body});
        setTitle("");
        setBody("");
    }

    if(isLoading) return <p> Loading...</p>
    if(error) return <p>Error: {error.message}</p>

    return(
        <div>
             <h1>Posts</h1>
             <ul>
        {data.map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      <h2>Add a Post</h2>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="title" />
        <textarea value={body} onChange={(e)=>setBody(e.target.value)} placeholder="body" />
        <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding...":"Add"}
        </button>
        {mutation.isError && <p style={{ color: "red" }}>Error: {mutation.error.message}</p>}
      </form>
        </div>
    )

}

export default OptimisticPost;
