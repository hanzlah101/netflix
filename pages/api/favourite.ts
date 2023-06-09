import { NextApiRequest, NextApiResponse } from "next";
import { without } from "lodash";
import prisma from "@/libs/prisma";
import serverAuth from "@/libs/serverAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const { currentUser } = await serverAuth(req);
      const { movieId } = req.body;
      const existingMovie = await prisma.movie.findUnique({
        where: { id: movieId },
      });

      if (!existingMovie) {
        throw new Error("Invalid ID");
      }

      const user = await prisma.user.update({
        where: { email: currentUser.email || "" },
        data: { favoriteIds: { push: movieId } },
      });

      return res.status(200).json(user);
    }

    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req);
      const { movieId } = req.body;
      const existingMovie = await prisma.movie.findUnique({
        where: { id: movieId },
      });

      if (!existingMovie) {
        throw new Error("Invalid ID");
      }

      const updatedFavouriteIds = without(currentUser.favoriteIds, movieId);

      const user = await prisma.user.update({
        where: { email: currentUser.email || "" },
        data: { favoriteIds: updatedFavouriteIds },
      });

      return res.status(200).json(user);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}

export default handler;
