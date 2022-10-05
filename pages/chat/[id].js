import {
  ArrowLeftIcon,
  CameraIcon,
  MicrophoneIcon,
  PhotographIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/solid";
import Moment from "react-moment";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import Loading from "../../components/Loading";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import getChatMessages from "../../utils/getChatMessages";
import getOtherEmail from "../../utils/getOtherEmail";
import axios from "axios";
import { useRecoilState } from "recoil";
import { themeState } from "../../atoms/theme";
import { uuidv4 } from "@firebase/util";
import { toast, ToastContainer } from "react-toastify";

const Chat = () => {
  const [text, setText] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState(false);
  const messages = getChatMessages(id);
  const [selectFile, setSelectFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const filePickerRef = useRef(null);
  const [status, setStatus] = useState(0);
  const [darkMode] = useRecoilState(themeState);
  const [chat] = useDocumentData(doc(db, `chats/${id}`));
  const [user] = useDocumentData(
    doc(db, `profile/${getOtherEmail(chat, session?.user)}`)
  );
  const [secUser, loading] = useDocumentData(
    doc(db, `profile/${session?.user.username}`)
  );

  const sendMessage = async (e) => {
    e.preventDefault();
    const msgToSend = text;
    setText("");

    if (selectFile) {
      const imgRef = selectFile;
      setSelectFile(null);
      setSending(true);
      const storageRef = ref(
        storage,
        `chats/${fileType}/${session?.user.username}-${uuidv4()}`
      );
      const uploadTask = uploadBytesResumable(storageRef, imgRef);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setStatus(percent);
        },
        (err) => {
          setStatus(0);
          setFileType("");
          setSending(false);
        },
        () => {
          // download url
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (url) => {
              await addDoc(collection(db, "chats", id, "messages"), {
                text: msgToSend,
                username: session.user.username,
                timeStamp: serverTimestamp(),
                [fileType]: url,
              });
            })
            .then(() => {
              msgSend(msgToSend);
            });
        }
      );
    } else {
      await addDoc(collection(db, "chats", id, "messages"), {
        text: msgToSend,
        username: session.user.username,
        timeStamp: serverTimestamp(),
      }).then(() => {
        msgSend(msgToSend);
      });
    }
  };
  const msgSend = (msgToSend) => {
    if (typeof Notification !== "undefined") {
      axios.post("/api/sendNotification", {
        interest: user.uid,
        title: secUser.fullname,
        body: fileType ? fileType + "/" : msgToSend,
        icon: secUser.profImg ? secUser.profImg : secUser.image,
        link: "https://insta-pro.vercel.app/chat/" + id,
      });
    }
    setStatus(0);
    setFileType("");
    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const unsendMessage = async (msgID) => {
    if (confirm("Unsend Message?")) {
      await deleteDoc(doc(db, "chats", id, "messages", msgID));
    }
  };

  const addMedia = (file) => {
    if (file) {
      setFileType(file.type.includes("image") ? "image" : "video");
      if (fileType === "image") {
        if (file.size / (1024 * 1024) > 3) {
          toast.error("Image size is larger than 3mb");
        } else {
          setSelectFile(file);
        }
      } else if (file.size / (1024 * 1024) > 50) {
        toast.error("Video size is larger than 50mb");
      } else {
        setSelectFile(file);
      }
    }
  };

  const getProfileImage = (username) => {
    if (user?.username === username) {
      return user.profImg ? user.profImg : user.image;
    } else {
      return secUser.profImg ? secUser.profImg : secUser.image;
    }
  };

  return (
    <div className={darkMode ? "bg-gray-100" : "dark bg-gray-900"}>
      <div className="max-w-6xl lg:mx-auto flex justify-center">
        <div
          className="dark:bg-black bg-[url('https://i.pinimg.com/originals/b7/fc/af/b7fcaf2631fc54f28ef3f123855d03dc.jpg')] dark:bg-[url('https://wallpapercave.com/wp/wp9100371.jpg')]
            bg-no-repeat bg-cover bg-center w-full flex flex-col md:w-[700px] h-screen overflow-y-scroll scrollbar-hide"
        >
          {/* Chat Header */}
          <section className="shadow-md bg-white sticky top-0 z-50 dark:bg-gray-900 dark:text-gray-200">
            <div className="flex items-center px-2 py-1">
              <ArrowLeftIcon
                onClick={() => router?.back()}
                className="btn m-1"
              />
              <div className="flex items-center justify-center p-[1px] rounded-full object-contain mx-2">
                <div className="relative w-12 h-12">
                  <Image
                    loading="eager"
                    layout="fill"
                    src={
                      user
                        ? user.profImg
                          ? user.profImg
                          : user.image
                        : require("../../public/userimg.jpg")
                    }
                    alt="prof"
                    className="rounded-full"
                  />
                </div>
              </div>
              <button
                disabled={user ? false : true}
                onClick={() => router.push(`/profile/${user?.username}`)}
                className="text-left"
              >
                <div className="flex items-center">
                  <h1 className="font-bold">
                    {user ? user?.fullname : "Loading..."}
                  </h1>
                  {user?.username === "hurairayounas" && (
                    <div className="relative h-4 w-4">
                      <Image
                        src={require("../../public/verified.png")}
                        layout="fill"
                        loading="eager"
                        alt="profile"
                        className="rounded-full"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <span className="text-xs md:text-sm text-gray-400">
                    active
                  </span>
                  {user?.active ? (
                    <span className="text-xs md:text-sm text-gray-400">
                      now
                    </span>
                  ) : (
                    <Moment
                      fromNow
                      className="text-xs md:text-sm text-gray-400"
                    >
                      {user?.timeStamp?.toDate()}
                    </Moment>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Chat Body */}
          <section className="flex-1">
            {user?.bio && (
              <div className="flex items-center justify-around m-2 p-2 mb-4 text-sm text-center text-gray-700 dark:bg-opacity-70 rounded-lg dark:bg-gray-900 dark:text-slate-400">
                <ArrowLeftIcon className="h-3 w-3" />
                {user?.bio}
                <ArrowRightIcon className="h-3 w-3" />
              </div>
            )}
            {user?.username ? (
              messages?.map((msg, i) => (
                <div
                  ref={messagesEndRef}
                  key={i}
                  className={`flex mt-1 ${
                    msg?.data().username === session?.user.username
                      ? "justify-end"
                      : ""
                  }`}
                >
                  <div className="text-gray-200 flex items-center rounded-md w-fit max-w-xs py-1 px-2 relative">
                    <div
                      className={`absolute top-1 rounded-full ${
                        msg?.data().username === session?.user.username
                          ? "right-2"
                          : ""
                      }`}
                    >
                      <button
                        onClick={() =>
                          router.push(`/profile/${msg?.data().username}`)
                        }
                        className="flex items-center justify-center object-contain"
                      >
                        <div className="relative w-7 h-7">
                          <Image
                            loading="eager"
                            layout="fill"
                            src={getProfileImage(msg.data().username)}
                            alt="prof"
                            className="rounded-full"
                          />
                        </div>
                      </button>
                    </div>
                    <div
                      className={`${
                        msg?.data().username === session?.user.username
                          ? "mr-9 bg-slate-600 bg-opacity-50"
                          : "ml-9 bg-stone-700 bg-opacity-50"
                      } p-2 rounded-lg`}
                    >
                      <div>{msg?.data().text}</div>
                      {msg.data().image && (
                        <div className="my-2 shadow-md p-2">
                          <img src={msg.data().image} alt="img" />
                        </div>
                      )}
                      {msg.data().video && (
                        <video
                          playsInline
                          controls
                          preload="none"
                          poster="https://domainjava.com/wp-content/uploads/2022/07/Link-Bokeh-Full-111.90-l50-204-Chrome-Video-Bokeh-Museum-2022.jpg"
                          className="w-full h-auto max-h-[300px] overflow-hidden my-2"
                        >
                          <source src={msg.data().video} />
                        </video>
                      )}
                      <div className="flex text-gray-300 justify-end">
                        <Moment fromNow className="text-[10px]">
                          {msg?.data()?.timeStamp?.toDate()}
                        </Moment>
                        <span className="ml-1 text-sm font-semibold text-gray-300 bg-transparent rounded-full">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="sr-only">deliverd</span>
                        </span>
                      </div>
                    </div>

                    {msg?.data().username === session?.user.username && (
                      <>
                        <XCircleIcon
                          className="h-7 w-7 absolute -left-6 cursor-pointer text-gray-800 overflow-hidden dark:text-gray-200"
                          onClick={() => unsendMessage(msg.id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Loading page={"List"} />
            )}
          </section>

          {/* Chat Bottom */}
          <section className="bg-gray-50 sticky bottom-0 z-50 shadow-sm mx-1 px-1 dark:text-white rounded-3xl dark:bg-gray-900">
            <form onSubmit={(e) => sendMessage(e)}>
              {(selectFile || sending) && (
                <div className="font-bold p-4 mr-3 text-gray-500 w-full text-right">
                  {sending ? (
                    <p>{`Uploading ${fileType}: ${status}%`}</p>
                  ) : (
                    selectFile && <h1>{selectFile.name}</h1>
                  )}
                </div>
              )}
              <div className="w-full border rounded-3xl h-12 flex justify-between items-center dark:border-none">
                <div className="flex items-center flex-1">
                  <div>
                    <CameraIcon
                      className="h-9 w-9 cursor-pointer text-gray-500 ml-2 dark:text-gray-200 bg-red-400 rounded-full p-1"
                      onClick={() => filePickerRef.current.click()}
                    />
                  </div>
                  <input
                    disabled={sending}
                    placeholder="Message..."
                    className="mx-2 outline-none text-md focus:ring-0 bg-transparent w-full"
                    value={text}
                    name={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <MicrophoneIcon className="h-7 w-7 cursor-pointer text-gray-500 dark:text-gray-200" />
                  <div>
                    <PhotographIcon
                      className="mx-2 h-8 w-8 cursor-pointer text-gray-500 dark:text-gray-200"
                      onClick={() => filePickerRef.current.click()}
                    />
                    <div>
                      <input
                        ref={filePickerRef}
                        type="file"
                        hidden
                        onChange={(e) => addMedia(e.target.files[0])}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={text || selectFile ? false : true}
                  >
                    <ArrowRightIcon
                      className={`mr-2 h-7 w-7 cursor-pointer text-blue-500 ${
                        text || selectFile ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </form>
          </section>
          <ToastContainer
            autoClose={2500}
            position={"top-center"}
            theme="dark"
            pauseOnFocusLoss={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
