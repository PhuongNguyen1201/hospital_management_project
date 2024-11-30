import { Children } from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card"
import { Header } from "./header";
import Social from "./social";
import { BackButton } from "./back-button";
interface CardWarpperProps{
    children:React.ReactNode;
    headerLabel:string;
    backButtonLabel:string;
    backButtonHref:string;
    showSocial?:boolean;
}
export const CardWarpper=({children,headerLabel,backButtonLabel,backButtonHref,showSocial}:CardWarpperProps)=>{
    return(
        <Card className="w-[400] shadow-md">
            <CardHeader>
                <Header label={headerLabel}/>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {showSocial&&(
                <CardFooter>
                    <Social/>
                </CardFooter>
            )}
            <CardFooter>
                <BackButton
                label={backButtonLabel}
                href={backButtonHref}
                />
            </CardFooter>
        </Card>
    )
}