import { NextResponse, NextRequest } from "next/server";


export async function GET(req: NextRequest) {
    try {
     const dakaziApiKey = process.env.DAKAZI_API_KEY;
     if(!dakaziApiKey){
        console.log('API key not found');
        return NextResponse.json({ message: "API key not found" }, { status: 500 });
     }
        const res1 = await fetch("https://reseller.dakazinabusinessconsult.com/api/v1/check-console-balance", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": `${dakaziApiKey}`,
            },
           

        });
        let data1 = await res1.json();

     



         const res2 = await fetch("https://reseller.dakazinabusinessconsult.com/api/v1/fetch-data-packages", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": `${dakaziApiKey}`,
            },
           

        });

   



     let data2 = await res2.json();
      const mtndata = data2.filter((item: any) => item.network === "MTN");  
      const teleceldata = data2.filter((item: any) => item.network === "TELECEL");  
      const airteltigodata = data2.filter((item: any) => item.network.startsWith("AT"));  
       



        return NextResponse.json({ AccountBalance:data1,mtnpackages:mtndata, telecelpackages:teleceldata, airteltigopackages:airteltigodata }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error" , error: error }, { status: 500 });
    }
}



