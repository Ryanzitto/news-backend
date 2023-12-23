import * as z from "zod";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios from "axios";

import { useStore } from "../store";
import { createCommentSchema } from "../zodSchema/createComment";

import Spinner from "./Spinner";

import { Modal } from "./General/Modal";

interface DateFormatOptions {
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
}

interface Post {
  banner: {
    src: string;
    _id: string;
  };
  comments: Array<any>;
  _id: string;
  likes: Array<any>;
  text: string;
  title: string;
  createdAt: string;
  user: {
    userName: string;
    avatar: {
      src: string;
      _id: string;
    };
    createdAt: string;
  };
}

interface Props {
  post: {
    banner: {
      src: string;
      _id: string;
    };
    comments: Array<any>;
    _id: string;
    likes: Array<any>;
    text: string;
    title: string;
    createdAt: string;
  };
}

interface PostID {
  _id: string;
}

type FormDataComment = z.infer<typeof createCommentSchema>;

export const Post = ({ _id }: PostID) => {
  const { user, currentPostUpdatingId, postIsLoading, logout } = useStore();

  const [load, setLoad] = useState<boolean>(false);

  const [post, setPost] = useState<Post | null>(null);

  const [showAllComments, setShowAllComments] = useState(false);

  const [userHasLiked, setUserHasLiked] = useState<boolean>(false);

  const [loadContent, setLoadContent] = useState<boolean>(postIsLoading);

  const [urlFormated, setUrlFormated] = useState<string | undefined>(undefined);

  const [urlAvatar, setUrlAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (post) {
      setUrlFormated("https://postagram-p8hh.onrender.com/" + post?.banner.src);
      setUrlAvatar(
        "https://postagram-p8hh.onrender.com/" + post.user.avatar.src
      );
    }
  }, [post]);

  const router = useRouter();

  const dateFormated = (date: string) => {
    const dataOriginal = date;

    const data = new Date(dataOriginal);

    const options: DateFormatOptions = {
      month: "long",
      day: "numeric",
    };
    const result = data.toLocaleDateString("pt-BR", options);
    return result;
  };

  const like = () => {
    if (post) {
      const baseUrl = "https://postagram-p8hh.onrender.com";
      axios
        .patch(
          `${baseUrl}/post/like/${post._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        )
        .then((response) => {
          console.log(response);
          fetchPost();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const fetchPost = () => {
    const baseUrl = "https://postagram-p8hh.onrender.com";
    axios
      .get(`${baseUrl}/post/${_id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((response) => {
        setPost(response.data.posts);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data.message === "Token has expired") {
          const timeout = setTimeout(() => {
            router.push("/login");
            logout();
          }, 1200);
          return () => clearTimeout(timeout);
        }
      });
  };

  useEffect(() => {
    fetchPost();
    setLoad(true);
  }, []);

  useEffect(() => {
    if (currentPostUpdatingId === post?._id) {
      fetchPost();
    }
  }, [currentPostUpdatingId]);

  useEffect(() => {
    setLoadContent(postIsLoading);
  }, [postIsLoading]);

  useEffect(() => {
    if (post) {
      setUserHasLiked(post.likes.some((obj) => obj.userId === user._id));
    }
    console.log(post);
  }, [post]);

  return (
    <motion.div
      whileInView={"visible"}
      initial={{
        opacity: 0,
      }}
      variants={{
        visible: {
          opacity: 1,
          transition: {
            duration: 1,
            delay: 0,
          },
        },
      }}
      className="relative w-full h-fit rounded-md flex items-center flex-col hover:bg-zinc-200/30 py-6 text-zinc-800 border border-slate-300"
    >
      {load === true && post ? (
        <>
          {loadContent === true && currentPostUpdatingId === _id ? (
            <Spinner />
          ) : (
            <>
              <div className="w-[90%] h-20 flex items-center">
                <div className="w-[10%]">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex justify-center items-center">
                    <div className="rounded-full w-[95%] h-[95%] flex justify-center items-center">
                      <img
                        className="rounded-full w-full h-full object-cover"
                        src={`https://postagram-p8hh.onrender.com/${post.user.avatar.src}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[90%]">
                  <div className="flex flex-col items-start h-full pb-3 pl-10 md:pl-8">
                    <span className="text-lg font-bold hover:opacity-80">
                      <Link href={`/perfil/${post?.user?.userName}`}>
                        {post?.user?.userName}
                      </Link>
                    </span>
                    <span className="text-xs">
                      {dateFormated(post?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-[90%] h-fit flex flex-col p-2">
                <h2 className="text-2xl font-black">{post.title}</h2>
                <h2 className="text-sm font-light">{post.text}</h2>
              </div>
              <div className="w-full h-fit flex justify-center items-center">
                <div className="w-[90%] h-fit pt-2 flex justify-center items-center">
                  <img className="rounded-md" src={urlFormated} />
                </div>
              </div>
              <div className="w-[90%] flex justify-end items-center gap-4 h-16 pr-2 py-1">
                <div className="flex justify-center items-center gap-1">
                  <span>{post.likes.length}</span>
                  <img
                    onClick={like}
                    className="cursor-pointer h-6 w-6"
                    src={
                      userHasLiked
                        ? "https://cdn-icons-png.flaticon.com/128/2589/2589175.png"
                        : "https://cdn-icons-png.flaticon.com/128/2589/2589197.png"
                    }
                  />
                </div>
              </div>
              <CreateComment post={post} />
            </>
          )}

          {post.comments.length >= 1 && (
            <div
              className={`w-[90%]  overflow-hidden ${
                showAllComments ? "h-fit" : "h-0"
              } flex flex-col gap-2 py-4 mt-4 rounded-md`}
            >
              <div className="w-full flex justify-end items-center pr-4">
                {post.comments.length >= 1 && (
                  <button
                    className="text-xs font-bold transition-colors text-zinc-800 hover:text-zinc-800/60"
                    onClick={() => setShowAllComments(!showAllComments)}
                  >
                    {showAllComments ? "Hide comments" : "Show comments"}
                  </button>
                )}
              </div>
              {post.comments.map((item) => {
                return (
                  <div
                    key={Date.now() * Math.random()}
                    className="w-full pl-4 p-2 rounded-md flex gap-2 items-center"
                  >
                    <span className="font-bold cursor-pointer hover:opacity-80 text-sm">
                      {item.userName}:
                    </span>
                    <p className="font-light text-xs font-medium text-zinc-800/80">
                      {item.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Spinner />
      )}
    </motion.div>
  );
};

const CreateComment = ({ post }: Props) => {
  const { user, logout, setPostIsLoading, fetchData } = useStore();

  const [inputText, setInputText] = useState<string | null>(null);

  const [text, setText] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean | null>(null);

  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormDataComment>({
    resolver: zodResolver(createCommentSchema),
  });

  async function onSubmit(data: FormDataComment) {
    const baseUrl = "https://postagram-p8hh.onrender.com";
    setPostIsLoading(true);
    axios
      .patch(
        `${baseUrl}/post/comment/${post._id}`,
        {
          comment: data.comment,
          userName: user.userName,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        setShowModal(true);
        setText("Comment created.");
        setStatus("success");
        const timeout = setTimeout(() => {
          setShowModal(false);
          fetchData("https://postagram-p8hh.onrender.com/post");
        }, 1200);

        return () => clearTimeout(timeout);
      })
      .catch((error) => {
        console.log(error);
        setShowModal(true);
        setText("Error.");
        setStatus("error");
        if (error.response.data.message === "Token has expired") {
          setShowModal(true);
          const timeout = setTimeout(() => {
            router.push("/login");
            logout();
          }, 1200);
          return () => clearTimeout(timeout);
        }
      });
  }

  return (
    <div className="w-[90%] flex justify-center items-center gap-2 pr-2 py-1">
      <div className="absolute w-full">
        {showModal === true && <Modal text={text} status={status} />}
      </div>
      <div className="w-[10%] max-h-[10%] flex justify-center items-center">
        <div className="rounded-full w-10 h-10 flex justify-center items-center">
          <img
            className="rounded-full w-full h-full object-cover"
            src={`https://postagram-p8hh.onrender.com/${user.avatar.src}`}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-[90%] flex flex-col">
        <div
          onChange={(e: any) => setInputText(e.target.value)}
          className="flex gap-4"
        >
          <input
            {...register("comment", { required: true })}
            id="comment"
            name="comment"
            autoComplete="off"
            placeholder="type a comment"
            className="border border-slate-300 h-10 pl-6 focus:outline-none w-full rounded-md"
          ></input>
          {inputText !== null && (
            <button
              type="submit"
              className="px-4 text-xl rounded-md transition-colors font-bold flex justify-center items-center text-zinc-800/50 hover:bg-zinc-200 hover:text-white"
            >
              <img
                className="w-6 h-6"
                src="https://cdn-icons-png.flaticon.com/128/11600/11600263.png"
              />
            </button>
          )}
        </div>
        {errors?.comment && (
          <p className="text-red-600 text-xs pt-2">
            {errors?.comment?.message}
          </p>
        )}
      </form>
    </div>
  );
};