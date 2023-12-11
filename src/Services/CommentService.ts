import { CommentsType } from "src/state/slices/graphSlice";
import api from "src/utils/api";
import { CommentsUrl } from "src/variables/Urls";

export async function getCommentsByProjectId({
  projectId,
}: {
  projectId: string;
}) {
  try {
    let config = {
      params: {
        projectId: projectId,
      },
    };
    const { data } = await api.get(CommentsUrl + "/get", config);
    return data as CommentsType[];
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function saveComment(comment: CommentsType) {
  if (comment.id) {
    const body = { ...comment };

    try {
      const response = await api.put(CommentsUrl + "/put", body);
      return response;
    } catch (error) {
      // console.log(
      //   "🚀 ~ file: CompanyService.ts:83 ~ saveCompany ~ error:",
      //   error
      // );
    }
  }
  try {
    const response_1 = await api.post(CommentsUrl + "/post", comment);
    return response_1;
  } catch (error_1: any) {
    // console.log(error_1.response);
  }
}

export function deleteComment(commentId: string) {
  return api
    .delete(CommentsUrl + "/delete", { data: { id: commentId } })
    .then((responce) => {
      return responce;
    })
    .catch((error) => {
      return error;
    });
}
