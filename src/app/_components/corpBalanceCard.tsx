"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { HTMLAttributes, forwardRef } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { getCorpBalanceCardInfo } from "~/server/action";

interface CorpBalanceCardProps extends HTMLAttributes<HTMLElement> {
  corp: corpInfoProps;
}

export interface corpInfoProps {
  id: string;
  name?: string;
  updatedAt?: Date;
  alliance_id?: number;
  esi_id: number;
  updatedBy: string;
  balance: number;
}

const CorpBalanceCard = forwardRef<HTMLDivElement, CorpBalanceCardProps>(
  function CorpBalanceCard({ className, corp }, ref) {
    const { data, error } = useQuery({
      queryKey: ["corpBalence", corp.esi_id],
      queryFn: async () => {
        return await getCorpBalanceCardInfo(corp.esi_id);
      },
      initialData: {
        balance: "---",
        updater: "--",
        updatedAt: "--",
      },
    });
    if (!data) {
      return (
        <Card
          x-chunk="dashboard-05-chunk-1"
          className={cn(className, "w-fit min-w-16")}
          ref={ref}
        >
          <CardHeader className="pb-2">
            <CardDescription>
              {corp.name}
              {"   #"}
              {corp.esi_id}
            </CardDescription>
            <CardTitle className="text-4xl">Nah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Updated by: nah, --
            </div>
          </CardContent>
          {/* <CardFooter>
          <Progress value={25} aria-label="25% increase" />
        </CardFooter> */}
        </Card>
      );
    }
    return (
      <Card
        x-chunk="dashboard-05-chunk-1"
        className={cn(className, "w-fit min-w-16")}
        ref={ref}
      >
        <CardHeader className="pb-2">
          <CardDescription>
            {corp.name}
            {"   #"}
            {corp.esi_id}
          </CardDescription>
          <CardTitle className="text-4xl">{data.balance}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Updated by: {data?.updater},{" "}
            {data.updatedAt != "--" ? moment(data.updatedAt).fromNow() : "--"}
          </div>
        </CardContent>
        {/* <CardFooter>
          <Progress value={25} aria-label="25% increase" />
        </CardFooter> */}
      </Card>
    );
  },
);

// export default function CorpBalenceCard({ id }: { id: number }) {
//     const {data, error} = useQuery({
//         queryKey: ["corpBalence", id],
//         queryFn: async () => {
//             const corpBalence = await queryCorpBalence(id);
//             return corpBalence;
//         }
//     })
// }

export default CorpBalanceCard;
