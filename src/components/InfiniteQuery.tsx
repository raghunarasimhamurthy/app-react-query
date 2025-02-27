import { useInfiniteQuery  } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from "react-intersection-observer";

const fetchPosts = async({pageParam = 1}:{pageParam?:number})=> {
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      
      return res.json();
}

const InfinitePosts = () => {
    const { ref, inView } = useInView(); // Detects when element is in view



    const {
        data,
        error,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        isFetchingNextPage,
      } = useInfiniteQuery({
        queryKey:["posts"],
        queryFn: ({ pageParam }:{pageParam?:number}) => fetchPosts({ pageParam}),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
            allPages.length +1,
        getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
            firstPageParam,
      })

          // Auto-fetch when user scrolls
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage]);

      if (!data) return <p>Loading...</p>;
      if (error) return <p>Error: {error.message}</p>;
      console.log(hasNextPage, isFetchingNextPage)
      return (
        <div>
          <h1>Infinite Scroll: Posts</h1>
          <ul>
            {data?.pages.flat().map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
    
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : hasNextPage ? "Load More" : "No More Posts"}
          </button>
          <button onClick={()=> fetchPreviousPage()} >
                Remove page
          </button>

          <div ref={ref}>
        {isFetchingNextPage ? <p>Loading more...</p> : <p>No more posts</p>}
      </div>
        </div>
      );
}

export default InfinitePosts;