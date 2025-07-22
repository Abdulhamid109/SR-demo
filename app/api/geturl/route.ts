// here we will be getting the url from the user

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PuppeteerScreenRecorder } from "puppeteer-screen-recorder";

export async function POST(request: NextRequest) {
    const browser = await puppeteer.launch({
        headless: false
    });
    try {
        const { Url } = await request.json();
        const page = await browser.newPage();
        //start the session here.
        const recorder = new PuppeteerScreenRecorder(page);
        await page.goto(Url);

        await page.setViewport({ width: 1920, height: 1080 });
        await recorder.start("./video/session01.mp4")
        //perform the actual working og login module...here
        // and also do the screen recording for it 
        await recorder.stop();
        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (error) {
        console.log('Internal Server error ' + error);
        return NextResponse.json(
            { error: "Internal Server Error : " + error },
            { status: 500 }
        )
    } finally {
        
        await browser.close();
    }
}