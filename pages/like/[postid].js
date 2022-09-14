import Loading from "../../components/Loading";
import { db } from "../../firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";;
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { themeState } from "../../atoms/theme";
import Image from "next/image";
import Moment from "react-moment";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { SearchIcon } from "@heroicons/react/outline";
import { collection, query, orderBy } from "firebase/firestore";
import { useSession } from "next-auth/react";

const LikeList = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const { postid } = router.query;
    const [likes, loading] = useCollectionData(query(collection(db, `posts/${postid}/likes`), orderBy("timeStamp", 'desc')));
    const [darkTheme] = useRecoilState(themeState);

    return (
        <div className={`${!darkTheme ? "dark bg-gray-900" : ""} h-screen overflow-y-scroll scrollbar-hide`}>
            <div className="w-full md:max-w-3xl m-auto dark:text-gray-200">

                {/* likes header */}
                <section className="sticky top-0 z-50 w-full md:max-w-3xl bg-white dark:bg-gray-900">
                    <div className="flex space-x-3 px-3 items-center bg-blue-500 dark:bg-gray-900 text-white h-16">
                        <ArrowLeftIcon className="h-6 w-6 cursor-pointer" onClick={() => router.back()} />
                        <h1 className="text-lg font-bold">Likes</h1>
                    </div>

                    <div className="mx-3 mt-5 flex">
                        <div className="flex items-center space-x-3 m-auto h-9 bg-slate-100 dark:bg-gray-700 rounded-lg p-3 w-full text-sm md:w-[60%]">
                            <SearchIcon className="h-4 w-4" />
                            <input className="bg-transparent outline-none focus:ring-0" placeholder="Search" />
                        </div>
                    </div>
                    <div className="mx-3 mt-5 flex justify-between items-center mb-2">
                        <h1 className="font-semibold">LIKED BY</h1>
                        {likes?.length && <p className="text-gray-400 text-sm">{likes.length} {likes.length === 1 ? "Like" : "Likes"}</p>}
                    </div>
                    <div className="mx-3 border-b-2 border-gray-500"></div>
                </section>

                <section className="flex-1 overflow-y-scroll scrollbar-hide">
                    {loading ? <Loading /> :
                        <div className="mx-3">
                            {likes?.map((like, i) => (
                                <div key={i} className="w-full flex justify-between items-center">
                                    <div className="relative h-16 flex items-center w-full">
                                        {like.userImg && <Image
                                            loading="eager"
                                            alt="image"
                                            src={like.userImg}
                                            height='40px'
                                            width='40px'
                                            className="rounded-full"
                                        />}
                                        <div className="ml-3">
                                            <h1 onClick={() => router.push(`/profile/${like.username}`)} className="font-bold mt-1 cursor-pointer">{like.username}</h1>
                                            {like.timeStamp &&
                                                <Moment className="text-gray-400 text-xs align-text-top" fromNow>{like.timeStamp.toDate()}</Moment>}
                                        </div>
                                    </div>
                                    {like.username !== session?.user.username && <button onClick={() => router.push(`/profile/${like.username}`)} className="bg-slate-600 py-1 px-6 text-xs font-semibold rounded-md text-white">
                                        Profile</button>}
                                </div>
                            ))}
                        </div>}
                </section>
            </div>
        </div>
    )
}

export default LikeList;