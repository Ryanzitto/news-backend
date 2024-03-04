import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  MessageCircleOff,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useStore } from "app/store";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema } from "../../zodSchema/createComment";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Comment {
  comment: string;
  createdAt: string;
  idComment: string;
  userId: string;
  userName: string;
}

interface Like {
  create: string;
  userId: string;
}

interface newComment {
  comment: string;
  createdAt: number;
  userName: string;
}

interface Props {
  post: {
    subject: string;
    text: string;
    bgColor: string;
    textColor: string;
    textAlign?: string;
    likes: Like[];
    comments: Comment[];
    createdAt: string;
    user: {
      name: string;
      userName: string;
      createdAt: string;
      avatar: string;
    };
    _id: string;
  };
}

type FormData = z.infer<typeof createCommentSchema>;

export default function Post({ post }: Props) {
  const URL = process.env.NEXT_PUBLIC_BASEURL;

  const { user, logout } = useStore();

  const router = useRouter();

  const [shouldShowComments, setShouldShowComments] = useState<boolean>(false);

  const [newComments, setNewComments] = useState<newComment[]>([]);

  const [userHasLiked, setUserHasLiked] = useState<boolean>(
    post.likes.some((item) => user._id === item.userId)
  );

  const handleClickUserName = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const [totalLikes, setTotalLikes] = useState<number>(post.likes.length);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createCommentSchema),
  });

  const [inputCommentContent, setInputCommentContent] = useState<string>("");

  async function onSubmit(data: FormData) {
    axios
      .patch(
        `${URL}/post/comment/${post._id}`,
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
        toast.success("A comment has been created.");
        setInputCommentContent("");
        createComment(data);
      })
      .catch((error) => {
        console.log(error);
        toast.error("An error ocurred");
      });
  }

  const createComment = (data: { comment: string }) => {
    const newComment = {
      comment: data.comment,
      createdAt: Date.now(),
      userName: user.userName,
    };

    setNewComments((prevState) => [...prevState, newComment]);
  };

  const like = () => {
    setUserHasLiked(!userHasLiked);
    axios
      .patch(
        `${URL}/post/like/${post._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        toast.success(`${response.data.message}`);
        if (response.data.message === "like successfull aplied") {
          setTotalLikes((total) => total + 1);
        }
        if (response.data.message === "like removed") {
          setTotalLikes((total) => total - 1);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="w-full h-fit bg-zinc-700/50 border border-zinc-500/80 rounded-lg p-4 grid">
      {/* <div className="justify-self-end mr-4 mt-4 absolute rounded-md w-6 h-6 bg-zinc-800/80 p-1 flex justify-center items-center">
        <MoreHorizontal className="cursor-pointer text-white w-4 rotate-90 flex" />
      </div> */}
      <div className="w-full flex h-fit">
        <div className="w-12 h-12 p-0.5 flex justify-center items-center bg-zinc-800/80 rounded-md">
          <img
            className="w-12 rounded-md"
            src={`/images/${post.user.avatar}`}
          />
        </div>
        <div className="flex flex-col w-fit gap-0.5 pl-4">
          <span className="text-white text-lg font-bold">{post.user.name}</span>

          <div className="flex gap-2 items-center">
            <span
              onClick={() => handleClickUserName(post.user.userName)}
              className="text-white/50 text-xs cursor-pointer transition-all hover:text-white/30 hover:underline"
            >
              @{post.user.userName}
            </span>
            <div className="w-1 h-1 rounded-full bg-white" />
            <span className="text-white/50 text-xs">
              {formatDistanceToNow(post.createdAt, {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
      <div
        className={`text-xl font-bold text-white tracking-wider w-full h-fit flex mt-6`}
      >
        <span>{post.subject}</span>
      </div>
      <div
        className={`w-full h-fit flex ${post.bgColor} break-all flex p-10 rounded-lg mt-4`}
      >
        <p
          className={`${post.textColor} w-full ${post.textAlign} text-2xl font-semibold tracking-wider`}
          style={{ whiteSpace: "pre-line" }}
        >
          {post.text}
        </p>
      </div>
      <div className="w-full flex justify-between h-fit pt-6">
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 h-fit items-center">
            {totalLikes > 0 && (
              <span
                className={`${
                  userHasLiked ? "text-pink-600" : "text-white"
                } text-lg font-semibold`}
              >
                {totalLikes}
              </span>
            )}
            <Heart
              onClick={like}
              className={`${
                userHasLiked ? "text-pink-600" : "text-white"
              }  w-5 cursor-pointer`}
            />
          </div>
          {shouldShowComments ? (
            <MessageCircle
              onClick={() => setShouldShowComments(!shouldShowComments)}
              className="text-white w-5 cursor-pointer transition-all hover:text-white/50"
            />
          ) : (
            <MessageCircleOff
              onClick={() => setShouldShowComments(!shouldShowComments)}
              className="text-white w-5 cursor-pointer transition-all hover:text-white/50"
            />
          )}

          <Send className="text-white w-5 cursor-pointer" />
        </div>
      </div>
      <div className="w-full h-[1px] bg-zinc-500/20 mt-6 mb-6 justify-self-center"></div>
      {shouldShowComments && (
        <div
          className={`w-full flex flex-col items-center justify-center px-6 ${
            post.comments.length > 0 ? "bg-zinc-700/50 " : "bg-transparent"
          }rounded-md py-2`}
        >
          {post.comments.map((comment) => {
            return (
              <div className="border border-zinc-600 my-2 w-full rounded-md flex flex-col justify-start py-2 px-4 gap-2 ">
                <div className="w-fit p-1 rounded-md bg-zinc-700 flex items-center px-2 gap-2">
                  <span
                    onClick={() => handleClickUserName(comment.userName)}
                    className="text-white/80 font-bold text-xs cursor-pointer transition-all hover:text-white/50 hover:underline"
                  >
                    @{comment.userName}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <span className="text-white/50 text-xs">
                    {formatDistanceToNow(comment.createdAt, {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <span className="text-white/50 font-semi-bold text-xs">
                  - {comment.comment}
                </span>
              </div>
            );
          })}

          {newComments.map((comment) => {
            return (
              <div className="border border-zinc-600 my-2 w-full rounded-md flex flex-col justify-start py-2 px-4 gap-2 ">
                <div className="w-fit p-1 rounded-md bg-zinc-700 flex items-center px-2 gap-2">
                  <span
                    onClick={() => handleClickUserName(comment.userName)}
                    className="text-white/80 font-bold text-xs cursor-pointer transition-all hover:text-white/50 hover:underline"
                  >
                    @{comment.userName}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <span className="text-white/50 text-xs">
                    {formatDistanceToNow(comment.createdAt, {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <span className="text-white/50 font-semi-bold text-xs">
                  - {comment.comment}
                </span>
              </div>
            );
          })}

          {post.comments.length === 0 && newComments.length === 0 && (
            <span className="text-white/50 text-xs">
              No comments yet, how about create the first one?
            </span>
          )}
        </div>
      )}
      <div
        className={` ${
          shouldShowComments ? "mt-6" : "mt-0"
        }  w-full flex h-12 justify-center sm:justify-between `}
      >
        <div className="hidden sm:flex w-[10%] items-center">
          <div className="w-12 h-12 p-0.5 flex justify-center items-center bg-none sm:bg-zinc-800/60 rounded-md">
            <img className="w-12 rounded-md" src={`/images/${user.avatar}`} />
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[89%] h-full flex text-sm rounded-xl  bg-zinc-800/60 justify-between items-center px-4"
        >
          <input
            {...register("comment", { required: true })}
            id="comment"
            name="comment"
            autoComplete="off"
            type="text"
            value={inputCommentContent}
            onChange={(e) => setInputCommentContent(e.target.value)}
            placeholder="What you think about this post?"
            className="w-full outline-none bg-transparent text-white/50 text-sm  placeholder:text-white/30 "
          />
          <button
            type="submit"
            className="text-white hover:text-white/50 transition-all cursor-pointer"
          >
            <Send className="w-5" />
          </button>
        </form>
      </div>
      <div className="w-full flex justify-center items-center">
        {errors?.comment && (
          <p className="text-red-600 text-xs pt-2">
            {errors?.comment?.message}
          </p>
        )}
      </div>
    </div>
  );
}
