import { useRecoilState } from "recoil";
import { modelState, storyState, themeState } from "../atoms/states";
import { Dialog, Transition } from "@headlessui/react";
import { CameraIcon } from "@heroicons/react/outline";
import { VideoCameraIcon, PhotographIcon } from "@heroicons/react/solid";
import { Fragment, useRef, useState } from "react";
import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { uuidv4 } from "@firebase/util";
import { toast } from "react-toastify";

const Model = () => {
  const { data: session } = useSession();
  const [storyModel, setStoryModel] = useRecoilState(storyState);
  const [darkMode] = useRecoilState(themeState);
  const [open, setOpen] = useRecoilState(modelState);
  const filePickerRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [selectFile, setSelectFile] = useState("");
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);
  const toastId = useRef(null);

  const postMedia = async () => {
    if (loading) return;
    setLoading(true);
    toastId.current = toast.loading("Uploading...");

    const storageRef = ref(
      storage,
      `${storyModel ? "stories" : "posts"}/${fileType}/${
        session.user.username
      }_${uuidv4()}`
    );
    const uploadTask = uploadBytesResumable(storageRef, selectFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setStatus(percent);
      },
      (err) => {
        toast.error(err);
        setOpen(false);
        setLoading(false);
        setStatus(0);
        setFileType("");
        setSelectFile(null);
      },
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          if (storyModel) {
            await addDoc(
              collection(db, `profile/${session.user.username}/stories`),
              {
                username: session.user.username,
                caption: caption,
                timeStamp: serverTimestamp(),
                [fileType]: url,
              }
            );
          } else {
            await addDoc(collection(db, "posts"), {
              username: session.user.username,
              caption: caption,
              timeStamp: serverTimestamp(),
              [fileType]: url,
            });
          }
        });

        toast.dismiss(toastId.current);
        toastId.current = null;
        toast.success("Post Uploaded Successfully 👍");
        setOpen(false);
        setLoading(false);
        setStatus(0);
        setFileType("");
        setSelectFile(null);
      }
    );
  };

  const addPost = (file) => {
    if (file) {
      setFileType(file.type.includes("image") ? "image" : "video");
      if (fileType === "image") {
        if (file.size / (1024 * 1024) > 3) {
          toast.error("Image size is larger than 3mb");
        } else {
          setSelectFile(file);
        }
      } else if (file.size / (1024 * 1024) > 20) {
        toast.error("Video size is larger than 20mb");
      } else {
        setSelectFile(file);
      }
    }
  };

  const closeModels = () => {
    setOpen(false);
    setStoryModel(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className={`${
          darkMode ? "" : "dark"
        } fixed z-50 inset-0 overflow-y-auto`}
        onClose={closeModels}
      >
        <div className="flex items-end justify-center min-h-[600px] md:min-h-[600px] pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-sm sm:p-6">
              <div>
                {selectFile ? (
                  <button
                    disabled={loading}
                    onClick={() => setSelectFile(null)}
                    className="font-bold flex items-center justify-center w-full space-x-2 dark:text-gray-200"
                  >
                    {fileType === "video" ? (
                      <VideoCameraIcon className="h-6 w-6" />
                    ) : (
                      <PhotographIcon className="h-6 w-6" />
                    )}
                    <p> ~{selectFile.name}</p>
                  </button>
                ) : (
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-gray-500 cursor-pointer">
                    <CameraIcon
                      onClick={() => filePickerRef.current.click()}
                      className="h-6 w-6 text-red-600 dark:text-gray-300"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-300"
                  >
                    {storyModel ? "Upload Story" : "Upload Media"}
                  </Dialog.Title>
                  <div>
                    <input
                      ref={filePickerRef}
                      type="file"
                      hidden
                      onChange={(e) => addPost(e.target.files[0])}
                    />
                  </div>
                  <div className="mt-2">
                    <textarea
                      disabled={loading}
                      onChange={(e) => setCaption(e.target.value)}
                      className="block mt-4 p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-0 dark:bg-gray-700 dark:border-gray-800 dark:text-white resize-none scrollbar-none dark:placeholder:text-gray-400"
                      type="text"
                      placeholder="Please enter a caption"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  disabled={!selectFile || loading}
                  className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white dark:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:bg-blue-500 dark:disabled:bg-gray-700 disabled:cursor-not-allowed hover:disabled:bg-gray-300 dark:hover:disabled:bg-gray-600"
                  onClick={postMedia}
                >
                  {loading
                    ? `Uploading ${status}%`
                    : `Post ${storyModel ? "Story" : "Media"}`}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Model;
