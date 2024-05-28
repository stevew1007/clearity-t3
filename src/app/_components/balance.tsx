// import { useSession } from "next-auth/react";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import {
  type DbCorpEntry,
  getAllCorps,
  queryCorpBalence,
} from "~/server/query";

import moment from "moment";

interface CorpBalenceCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  corp: DbCorpEntry;
}

const CorpBalenceCard = React.forwardRef<HTMLDivElement, CorpBalenceCardProps>(
  async function CorpBalenceCard({ className, corp }, ref) {
    const data = await queryCorpBalence(corp.esi_id!);
    // console.log("data::: ", data);
    let balenceStr = "Nah";
    let time_since = null;
    if (data?.balence) {
      balenceStr = data.balence
        ? `${new Intl.NumberFormat().format(data.balence / 1000000000)}B isk`
        : "Nah";
      if (data?.updated_at) {
        time_since = moment(data.updated_at).fromNow();
      }
    }
    // const query = useQuery({
    //   queryFn: async () => {
    //     return await queryCorpBalence(corp.esi_id!);
    //   },
    //   queryKey: [`corp-balence-${corp.esi_id}`],
    // });

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
          <CardTitle className="text-4xl">{balenceStr}</CardTitle>
        </CardHeader>
        {corp.updatedBy && (
          <CardContent>
            <div className="text-muted-foreground text-xs">
              Updated by: #{data?.updater_id}{" "}
              {data?.updated_at && moment(data.updated_at).fromNow()}
            </div>
          </CardContent>
        )}
        {/* <CardFooter>
        <Progress value={25} aria-label="25% increase" />
      </CardFooter> */}
      </Card>
    );
  },
);
// export async function Balance() {
export const Balance = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(async function Balance({ className }, ref) {
  const corps = getAllCorps();

  return (
    <div className={cn(className, "flex gap-4")} ref={ref}>
      {(await corps).map(async (corp: DbCorpEntry, index) => {
        return (
          <Card className="" key={index}>
            <CorpBalenceCard corp={corp} />
          </Card>
        );
      })}
    </div>
  );
});
