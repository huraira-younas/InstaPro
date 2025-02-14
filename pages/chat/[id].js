import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/solid";
import Moment from "react-moment";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import EditGroup from "../../components/EditGroup";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import Loading from "../../components/Loading";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import {
  getChatMessages,
  getAllUsers,
  getUser,
  getName,
  getOtherEmail,
  getUserProfilePic,
} from "../../utils/utilityFunctions";
import { useRecoilState } from "recoil";
import { themeState, userActivity } from "../../atoms/states";
import sendPush from "../../utils/sendPush";
import {
  UserAddIcon,
  UserGroupIcon,
  ViewListIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/outline";
import GroupMembers from "../../components/GroupMembers";
import SetStatus from "../../components/SetStatus";
import useRecorder from "../../components/useRecorder";

const Chat = () => {
  const [text, setText] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef(null);
  const users = getAllUsers();
  const [menu, setMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const [editGroup, setEditGroup] = useState(false);
  const [lim, setLim] = useState(15);
  const messages = getChatMessages(id, lim);
  const [selectFile, setSelectFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const filePickerRef = useRef(null);
  const [status, setStatus] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const [darkMode] = useRecoilState(themeState);
  const [chat, setChat] = useState({});
  const you = getUser(session?.user.username, users);
  const [user, setUser] = useState({});
  const [active, setActive] = useRecoilState(userActivity);
  let [audioURL, isRecording, startRecording, stopRecording] = useRecorder();
  const [noMore, setNoMore] = useState(false);

  useEffect(() => {
    if (messages?.length < lim) {
      setNoMore(true);
    } else {
      setNoMore(false);
    }
  }, [messages?.length, lim]);

  const creator = getName(
    getUser(
      chat?.users?.filter((itr) => (itr.creator === true ? true : false))[0]
        ?.username,
      users
    )
  );

  useEffect(() => {
    let unsubChats;
    let unsubGroups;
    if (id) {
      if (id.includes("group")) {
        unsubGroups = onSnapshot(doc(db, `groups/${id}`), (snapshot) => {
          if (snapshot.exists()) {
            setChat(snapshot.data());
          }
        });
      } else {
        unsubChats = onSnapshot(doc(db, `chats/${id}`), (snapshot) => {
          if (snapshot.exists()) {
            setChat(snapshot.data());
          }
        });
      }
    }
    return () => {
      if (unsubChats) {
        unsubChats();
      }
      if (unsubGroups) {
        unsubGroups();
      }
    };
  }, [router]);

  useEffect(() => {
    if (chat !== {} && !id?.includes("group")) {
      setUser(getUser(getOtherEmail(chat, session?.user), users));
    }
  }, [chat, id, users]);

  useEffect(() => {
    if (audioURL) {
      sendAudio();
    }
  }, [audioURL]);

  const sendAudio = async () => {
    const check = id?.includes("group") ? "groups" : "chats";
    await addDoc(collection(db, check, id, "messages"), {
      audio: audioURL,
      type: "audio/ogg",
      username: session.user.username,
      timeStamp: serverTimestamp(),
    }).then(async () => {
      msgSend("audio");
      await updateDoc(doc(db, check, id), {
        timeStamp: serverTimestamp(),
      });
      audioURL = "";
    });
  };

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
        `chats/${fileType}/${you?.username}-${you?.uid}`
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
        () => {
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
    } else if (msgToSend.split(" ").join("").length > 0) {
      const check = id?.includes("group") ? "groups" : "chats";
      await addDoc(collection(db, check, id, "messages"), {
        text: msgToSend,
        username: session.user.username,
        timeStamp: serverTimestamp(),
      }).then(async () => {
        msgSend(msgToSend);
        await updateDoc(doc(db, check, id), {
          timeStamp: serverTimestamp(),
        });
      });
    }
  };

  const msgSend = (msgToSend) => {
    chat?.users.forEach((itruser) => {
      if (itruser.username !== you.username) {
        sendPush(
          getUser(itruser.username, users).uid,
          chat.name ? "" : you.fullname,
          chat.name ? you.fullname : "",
          chat.name
            ? `has send message in ${chat.name}`
            : fileType
            ? fileType + "/"
            : msgToSend,
          chat.image ? chat.image : you.profImg ? you.profImg : you.image,
          "https://insta-pro.vercel.app/chat/" + id
        );
      }
    });
    setStatus(0);
    setFileType("");
    setSending(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 5000);
    return () => {
      console.log("Cleared Time");
      clearTimeout(timeout);
    };
  }, [lim]);

  const unsendMessage = async (msgID) => {
    if (confirm("Unsend Message?")) {
      await deleteDoc(
        doc(
          db,
          id?.includes("group") ? "groups" : "chats",
          id,
          "messages",
          msgID
        )
      );
    }
  };

  const addMedia = (file) => {
    if (file) {
      setFileType(file.type.includes("image") ? "image" : "video");
      if (fileType === "image") {
        if (file.size / (1024 * 1024) > 3) {
          alert("Image size is larger than 3mb");
        } else {
          setSelectFile(file);
        }
      } else if (file.size / (1024 * 1024) > 50) {
        alert("Video size is larger than 50mb");
      } else {
        setSelectFile(file);
      }
    }
  };

  const addUser = async () => {
    setMenu(false);
    const status = chat?.users?.find((user) => user.username === you.username);
    if (status.admin || status.creator) {
      const newUser = prompt("Enter Username: ")
        ?.split(" ")
        .join("")
        .toLowerCase();
      if (newUser?.length > 0) {
        if (users?.findIndex((user) => user.username === newUser) !== -1) {
          if (
            chat?.users?.findIndex((user) => user.username === newUser) === -1
          ) {
            await updateDoc(doc(db, "groups", id), {
              users: [...chat.users, { username: newUser }],
            }).then(() => {
              sendPush(
                getUser(newUser, users).uid,
                "",
                you.fullname,
                `has added you in ${chat?.name}`,
                you.profImg ? you.profImg : you.image,
                "https://insta-pro.vercel.app/chat/" + id
              );
              alert("User added successfully");
            });
          } else {
            alert("User already added in group");
          }
        } else {
          alert("User Not Found 😐");
        }
      }
    } else {
      alert("You are not admin");
    }
  };

  return (
    <div className={darkMode ? "bg-gray-100" : "dark bg-gray-900"}>
      <div className="relative max-w-3xl lg:mx-auto flex justify-center">
        <div
          className="dark:bg-black bg-[url('https://browsecat.net/sites/default/files/neon-iphone-wallpapers-46872-643845-2936383.png')]
            bg-no-repeat bg-cover bg-center w-full flex flex-col md:w-[700px] h-screen overflow-y-scroll scrollbar-hide"
        >
          {chat?.name && (
            <GroupMembers
              deleteDoc={deleteDoc}
              updateDoc={updateDoc}
              doc={doc}
              db={db}
              name={chat?.name}
              members={chat?.users}
              router={router}
              you={session?.user.username}
              id={id}
              users={users}
              getUser={getUser}
              showMembers={showMembers}
              setShowMembers={setShowMembers}
            />
          )}
          {editGroup && (
            <EditGroup
              gName={chat?.name}
              gDesc={chat?.description}
              setEditGroup={setEditGroup}
              getDownloadURL={getDownloadURL}
              updateDoc={updateDoc}
              doc={doc}
              you={you}
              uploadBytesResumable={uploadBytesResumable}
              db={db}
              id={id}
              storage={storage}
            />
          )}
          {/* Chat Header */}
          <section className="shadow-md bg-white sticky top-0 z-20 dark:bg-gray-900 dark:text-gray-200">
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
                      chat?.image
                        ? chat.image
                        : user?.profImg
                        ? user.profImg
                        : user?.image
                        ? user.image
                        : require("../../public/userimg.jpg")
                    }
                    alt="prof"
                    className="rounded-full"
                  />
                </div>
              </div>
              <button
                disabled={user ? (chat?.name ? true : false) : true}
                onClick={() => router.push(`/profile/${user?.username}`)}
                className="text-left"
              >
                <div className="flex items-center">
                  <h1 className="font-bold">
                    {chat?.name
                      ? chat.name
                      : user?.fullname
                      ? user.fullname
                      : user?.username
                      ? user.username
                      : "Loading..."}
                  </h1>
                  {!chat?.name && user?.username === "hurairayounas" && (
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
                    {creator ? "created by" : "active"}
                  </span>
                  {!creator ? (
                    user?.active ? (
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
                    )
                  ) : (
                    <span className="text-xs md:text-sm text-gray-400">
                      {creator}
                    </span>
                  )}
                </div>
              </button>
              {id?.includes("group") && (
                <button
                  onClick={() => setMenu((prev) => !prev)}
                  className="absolute right-3 top-2 items-center p-2 text-sm font-medium text-center"
                  type="button"
                >
                  <div className="flex space-x-2">
                    <ViewListIcon className="h-6 w-6" />
                    {menu ? (
                      <svg
                        className="w-6 h-6"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                  </div>
                </button>
              )}
              <div
                hidden={!menu}
                className="absolute right-3 top-16 z-10 w-44 bg-white rounded shadow dark:bg-gray-900"
              >
                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                  <li>
                    <button
                      onClick={addUser}
                      className="flex items-center w-full py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-left"
                    >
                      <UserAddIcon className="mr-2 h-5 w-5" />
                      Add User
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setMenu(false);
                        setEditGroup(true);
                      }}
                      className="flex items-center w-full py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                        />
                      </svg>
                      Edit Group
                    </button>
                    <button
                      onClick={() => {
                        setMenu(false);
                        setShowMembers(true);
                      }}
                      className="flex items-center w-full py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-left"
                    >
                      <UserGroupIcon className="mr-2 h-5 w-5" />
                      Members
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Chat Body */}
          <section className="flex-1 flex flex-col justify-end relative pt-16 pb-2">
            {(chat?.description || user?.bio) && (
              <div
                className="absolute top-1 flex gap-2 items-center w-full bg-gray-700 border border-gray-800 text-gray-200 bg-opacity-40 px-4 py-3 rounded"
                role="alert"
              >
                <strong className="font-bold">
                  {id?.includes("group") ? "Description: " : "Bio: "}
                </strong>
                <span className="block sm:inline truncate">
                  {chat?.description || user?.bio}
                </span>
              </div>
            )}
            {messages?.length > 0 && !noMore && (
              <button
                onClick={() => setLim((prev) => prev + 10)}
                className="w-full text-white font-semibold"
              >
                Load More Messages
              </button>
            )}
            {messages?.length > 0 || chat?.users ? (
              messages?.map((_, i) => (
                <div
                  ref={messagesEndRef}
                  key={i}
                  className={`flex ${
                    messages[messages.length - 1 - i]?.data().username ===
                    you?.username
                      ? "justify-end"
                      : `mt-1 ${chat?.name ? "mt-5" : ""}`
                  }`}
                >
                  <div className="dark:text-gray-200 flex items-center rounded-md w-fit max-w-xs py-1 px-2 relative">
                    <div
                      className={`absolute top-1 rounded-full ${
                        messages[messages.length - 1 - i]?.data().username ===
                        you?.username
                          ? "right-2"
                          : ""
                      }`}
                    >
                      <button
                        onClick={() =>
                          router.push(
                            `/profile/${
                              messages[messages.length - 1 - i]?.data().username
                            }`
                          )
                        }
                        className="flex items-center justify-center object-contain"
                      >
                        <div className="relative w-7 h-7">
                          <Image
                            loading="eager"
                            layout="fill"
                            src={getUserProfilePic(
                              messages[messages.length - 1 - i].data().username,
                              users
                            )}
                            alt="prof"
                            className="rounded-full"
                          />
                        </div>
                      </button>
                    </div>
                    <div
                      className={`${
                        messages[messages.length - 1 - i]?.data().username ===
                        you?.username
                          ? `mr-9 ${
                              messages[messages.length - 1 - i]?.data().audio
                                ? ""
                                : "bg-green-400 bg-opacity-50 dark:bg-slate-600 dark:bg-opacity-50 backdrop-blur-sm"
                            }`
                          : `ml-9 ${
                              messages[messages.length - 1 - i]?.data().audio
                                ? ""
                                : "bg-blue-400 bg-opacity-50 dark:bg-slate-600 dark:bg-opacity-50 backdrop-blur-sm"
                            }`
                      } py-1 px-3 rounded-lg font-normal`}
                    >
                      <p>{messages[messages.length - 1 - i]?.data().text}</p>
                      {messages[messages.length - 1 - i].data().image && (
                        <div className="my-2 shadow-md p-2">
                          <img
                            src={messages[messages.length - 1 - i].data().image}
                            alt="img"
                          />
                        </div>
                      )}
                      {messages[messages.length - 1 - i].data()?.audio && (
                        <div className="mt-3">
                          <audio controls>
                            <source
                              src={
                                messages[messages.length - 1 - i].data()?.audio
                              }
                              type="audio/ogg"
                            ></source>
                          </audio>
                        </div>
                      )}
                      {messages[messages.length - 1 - i].data().video && (
                        <video
                          playsInline
                          controls
                          preload="none"
                          poster="https://domainjava.com/wp-content/uploads/2022/07/Link-Bokeh-Full-111.90-l50-204-Chrome-Video-Bokeh-Museum-2022.jpg"
                          className="w-full h-auto max-h-[300px] overflow-hidden my-2"
                        >
                          <source
                            src={messages[messages.length - 1 - i].data().video}
                          />
                        </video>
                      )}
                      <div className="flex text-gray-700 dark:text-gray-300 justify-end">
                        <Moment fromNow className="text-[10px]">
                          {messages[messages.length - 1 - i]
                            ?.data()
                            ?.timeStamp?.toDate()}
                        </Moment>
                        <span className="ml-1 text-sm bg-transparent rounded-full">
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

                    {messages[messages.length - 1 - i]?.data().username ===
                      you.username && (
                      <TrashIcon
                        className="h-5 w-5 absolute -left-6 cursor-pointer text-gray-800 overflow-hidden dark:text-gray-200"
                        onClick={() =>
                          unsendMessage(messages[messages.length - 1 - i].id)
                        }
                      />
                    )}
                    {chat?.name &&
                      messages[messages.length - 1 - i]?.data().username !==
                        you.username && (
                        <span className="absolute text-xs -top-3 left-11">
                          {getName(
                            getUser(
                              messages[messages.length - 1 - i].data().username,
                              users
                            )
                          )}
                        </span>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <Loading page={"List"} chat={true} />
            )}
          </section>

          {/* Chat Bottom */}
          <section className="bg-gray-50 sticky bottom-0 z-20 shadow-sm px-1 dark:text-white dark:bg-gray-900">
            {(selectFile || sending || isRecording) && (
              <div className="font-bold p-4 mr-3 text-gray-500 w-full text-right">
                {sending ? (
                  <p>{`Uploading ${fileType}: ${status}%`}</p>
                ) : (
                  selectFile && <h1>{selectFile.name}</h1>
                )}
                {isRecording && <h1>Recording...</h1>}
              </div>
            )}
            <form onSubmit={(e) => sendMessage(e)}>
              <div className="flex items-center p-2 bg-gray-50 rounded-lg dark:bg-gray-900">
                <button
                  onClick={() => filePickerRef.current.click()}
                  type="button"
                  className="inline-flex justify-center py-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400"
                >
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Upload image</span>
                </button>
                <input
                  ref={filePickerRef}
                  hidden
                  type="file"
                  onChange={(e) => addMedia(e.target.files[0])}
                />
                <button
                  type="button"
                  className="inline-flex justify-center py-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 ml-2"
                >
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Add emoji</span>
                </button>
                <textarea
                  disabled={sending}
                  value={text}
                  name={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="1"
                  className="block mx-4 p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-0 dark:bg-gray-800 dark:border-gray-800 dark:text-white resize-none scrollbar-none"
                  placeholder="Your message..."
                ></textarea>
                {text ? (
                  <button
                    onClick={(e) => sendMessage(e)}
                    disabled={text || selectFile ? false : true}
                    type="submit"
                    className={`transition-all duration-500 inline-flex justify-center py-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 ${
                      text || selectFile
                        ? "animate-pulse dark:text-blue-600"
                        : ""
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      className="w-6 h-6 rotate-90"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                    <span className="sr-only">Send message</span>
                  </button>
                ) : !isRecording ? (
                  <MicrophoneIcon
                    onClick={startRecording}
                    disabled={isRecording}
                    className="h-8 w-8 btn text-gray-300"
                  />
                ) : (
                  <StopIcon
                    onClick={(e) => {
                      stopRecording();
                      sendMessage(e);
                    }}
                    disabled={!isRecording}
                    className="h-8 w-8 btn text-red-500"
                  />
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
      <SetStatus
        username={session?.user.username}
        active={active}
        setActive={setActive}
      />
    </div>
  );
};

export default Chat;
