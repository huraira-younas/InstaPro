import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebase";
import Post from "./Post";
import Loading from "./Loading";
import { useRouter } from "next/router";
import Likes from "../components/Likes";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { postView } from "../atoms/postView";
import { useRecoilState } from "recoil";
import { likesView } from "../atoms/likesView";

const Posts = ({
  setTotalPosts,
  profile,
  setLoad,
  showFollowers,
  showFollowings,
}) => {
  const [posts, setPosts] = useState(undefined);
  const [postLikes, setPostLikes] = useState([]);
  const router = useRouter();
  const [view] = useRecoilState(postView);
  const toastId = useRef(null);
  const [users, loading] = useCollectionData(collection(db, "profile"));
  const [openLikes, setOpenLikes] = useRecoilState(likesView);

  useEffect(() => {
    if (posts) {
      setLoad(true);
    }
  }, [posts]);

  useEffect(() => {
    let sub = true;
    if (router.pathname === "/" && sub) {
      onSnapshot(
        query(collection(db, "posts"), orderBy("timeStamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
        }
      );
    }
    return () => (sub = false);
  }, [router.pathname]);

  useEffect(() => {
    let sub = true;
    if (router.pathname !== "/" && sub) {
      getDocs(
        query(
          collection(db, "posts"),
          where("username", "==", profile),
          orderBy("timeStamp", "desc")
        )
      ).then((snapshot) => {
        setPosts(snapshot?.docs);
        setTotalPosts(snapshot.docs?.length);
      });
    }
    return () => (sub = false);
  }, [profile, router.pathname]);

  const deletePost = async (id) => {
    if (confirm("Do you really want to delete this post?")) {
      toastId.current = toast.loading("deleting...");
      setPosts(posts?.filter((post) => post.id !== id));
      await deleteDoc(doc(db, "posts", id)).then(() => {
        toast.dismiss(toastId.current);
        toastId.current = null;
        toast.success("Post Deleted Successfully 👍");
      });
    }
  };

  return (
    <>
      {openLikes && (
        <Likes
          setOpenLikes={setOpenLikes}
          users={users}
          likes={postLikes}
          router={router}
        />
      )}
      <div
        className={`relative ${openLikes ? "hidden" : ""} mb-14 ${
          showFollowers || showFollowings ? "hidden" : ""
        } ${
          router.asPath !== "/" && !view
            ? `grid ${
                posts?.length ? "grid-cols-3" : "grid-cols-1"
              } place-items-center md:flex md:flex-wrap p-3 justify-left`
            : ""
        }`}
      >
        {loading && posts === undefined ? (
          <Loading page={" "} />
        ) : (
          posts?.map((post, index) => (
            <Post
              key={post.id}
              id={post.id}
              ind={index}
              post={post}
              router={router}
              deletePost={deletePost}
              setOpenLikes={setOpenLikes}
              setPostLikes={setPostLikes}
              user={
                users?.filter(
                  (user) => user.username === post.data().username
                )[0]
              }
            />
          ))
        )}
        {posts?.length === 0 && (
          <h1 className="absolute font-bold left-[41%] top-[200px] text-gray-400">
            No posts yet 🙁
          </h1>
        )}
      </div>
    </>
  );
};

export default Posts;
