import { NextRequest, NextResponse } from "next/server";
import { connect } from "puppeteer-real-browser";

// Helper function to wait/delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  let browser;
  let page;

  try {
    const { facebookEmail, facebookPassword, twoFactorCode } = await request.json();
    
    // Connect with puppeteer-real-browser
    const connection = await connect({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      turnstile: true,
      connectOption: {
        defaultViewport: { width: 1400, height: 900 }
      }
    });
    
    browser = connection.browser;
    page = connection.page;
    
    const Url = "https://www.facebook.com/";
    await page.goto(Url, { waitUntil: "networkidle2" });

    // Wait for page to load
    await delay(2000);

    // Check if already logged in by looking for profile elements or home feed
    try {
      const isLoggedIn = await page.evaluate(() => {
        // Check for various elements that indicate user is logged in
        const feedSelector = '[role="main"]';
        const profileSelector = '[data-testid="blue_bar_profile_link"]';
        const homeSelector = '[data-testid="Keycommand_wrapper_CloseFriends"]';
        
        return !!(document.querySelector(feedSelector) || 
                 document.querySelector(profileSelector) || 
                 document.querySelector(homeSelector) ||
                 !document.querySelector('[data-testid="royal_login_form"]'));
      });

      if (!isLoggedIn) {
        console.log("Already logged in!");
        await browser.close();
        return NextResponse.json({ success: true, message: "Already logged in" });
      }
    } catch (error) {
      console.log("Checking login status failed, proceeding with login...");
    }

    // Look for login form
    await page.waitForSelector('[name="email"]', { timeout: 10000 });
    console.log("Login form found, proceeding with login...");

    // Add realistic delay before typing
    await delay(1000 + Math.random() * 1000);

    // Clear and type email
    await page.click('[name="email"]');
    await page.evaluate(() => {
      const emailField = document.querySelector('[name="email"]') as HTMLInputElement;
      if (emailField) emailField.value = '';
    });
    await page.type('[name="email"]', facebookEmail, { 
      delay: 80 + Math.random() * 40 
    });

    // Small delay between fields
    await delay(500 + Math.random() * 300);

    // Clear and type password
    await page.click('[name="pass"]');
    await page.evaluate(() => {
      const passField = document.querySelector('[name="pass"]') as HTMLInputElement;
      if (passField) passField.value = '';
    });
    await page.type('[name="pass"]', facebookPassword, { 
      delay: 80 + Math.random() * 40 
    });

    // Wait before clicking login
    await delay(1000 + Math.random() * 500);

    // Click login button
    await page.click('[name="login"]');
    
    // Wait for page response after login
    await delay(5000);

    // Check current URL and page content
    const currentUrl = page.url();
    console.log("Current URL after login attempt:", currentUrl);

    // Check for 2FA requirement - look for common 2FA selectors
    // const has2FA = await page.evaluate(() => {
    //   const selectors = [
    //     '[name="approvals_code"]',
    //     'input[placeholder*="security code"]',
    //     'input[placeholder*="confirmation code"]',
    //     'input[aria-label*="security code" i]',
    //     'input[aria-label*="confirmation code" i]',
    //     '[data-testid="confirmation_code"]'
    //   ];
      
    //   return selectors.some(selector => document.querySelector(selector));
    // });

    // if (has2FA) {
    //   console.log("2FA required!");
      
    //   if (!twoFactorCode) {
    //     // Don't close browser, keep it open for 2FA
    //     return NextResponse.json({ 
    //       success: false, 
    //       requiresTwoFactor: true,
    //       message: "Two-factor authentication code required" 
    //     }, { status: 200 });
    //   }

    //   // Handle 2FA
    //   console.log("Entering 2FA code...");
      
    //   // Find the 2FA input field
    //   const twoFactorInput = await page.evaluate(() => {
    //     const selectors = [
    //       '[name="approvals_code"]',
    //       'input[placeholder*="security code"]',
    //       'input[placeholder*="confirmation code"]',
    //       'input[aria-label*="security code" i]',
    //       'input[aria-label*="confirmation code" i]',
    //       '[data-testid="confirmation_code"]'
    //     ];
        
    //     for (const selector of selectors) {
    //       const element = document.querySelector(selector);
    //       if (element) return selector;
    //     }
    //     return null;
    //   });

    //   if (!twoFactorInput) {
    //     await browser.close();
    //     return NextResponse.json({ 
    //       success: false, 
    //       message: "2FA input field not found" 
    //     }, { status: 400 });
    //   }

    //   // Clear and enter 2FA code
    //   await delay(1000);
    //   await page.click(twoFactorInput);
    //   await page.evaluate((selector) => {
    //     const element = document.querySelector(selector) as HTMLInputElement;
    //     if (element) element.value = '';
    //   }, twoFactorInput);
    //   await page.type(twoFactorInput, twoFactorCode, { delay: 100 });

    //   // Look for and click submit button
    //   const submitClicked = await page.evaluate(() => {
    //     const submitSelectors = [
    //       'button[type="submit"]',
    //       'button[value="Continue"]',
    //       'input[type="submit"]',
    //       'button[data-testid*="submit"]'
    //     ];

    //     for (const selector of submitSelectors) {
    //       const button = document.querySelector(selector) as HTMLElement;
    //       if (button && button.offsetParent !== null) { // Check if visible
    //         button.click();
    //         return true;
    //       }
    //     }
    //     return false;
    //   });

    //   if (!submitClicked) {
    //     // Try pressing Enter if no submit button found
    //     await page.keyboard.press('Enter');
    //   }

    //   // Wait for 2FA processing
    //   await delay(5000);

    //   // Check if 2FA was successful
    //   const isLoginSuccessful = await page.evaluate(() => {
    //     // Check if we're on Facebook main page and not on login/checkpoint pages
    //     const isOnFacebook = window.location.hostname.includes('facebook.com');
    //     const isNotOnLogin = !window.location.pathname.includes('login');
    //     const isNotOnCheckpoint = !window.location.pathname.includes('checkpoint');
    //     const hasMainContent = !!(document.querySelector('[role="main"]') || 
    //                              document.querySelector('[data-testid="blue_bar_profile_link"]'));
        
    //     return isOnFacebook && isNotOnLogin && isNotOnCheckpoint && hasMainContent;
    //   });

    //   if (isLoginSuccessful) {
    //     console.log("2FA successful!");
    //     await browser.close();
    //     return NextResponse.json({ 
    //       success: true, 
    //       message: "Login successful with 2FA!" 
    //     });
    //   } else {
    //     await browser.close();
    //     return NextResponse.json({ 
    //       success: false, 
    //       message: "Invalid 2FA code or login failed" 
    //     }, { status: 400 });
    //   }
    // }

    // // Check for other security challenges
    // const hasSecurityChallenge = await page.evaluate(() => {
    //   const challengeTexts = [
    //     "We need to confirm",
    //     "Please confirm",
    //     "security check",
    //     "checkpoint",
    //     "verify your identity"
    //   ];
      
    //   const pageText = document.body.innerText.toLowerCase();
    //   return challengeTexts.some(text => pageText.includes(text.toLowerCase()));
    // });

    // if (hasSecurityChallenge) {
    //   // Keep browser open for manual verification
    //   setTimeout(async () => {
    //     try {
    //       await browser.close();
    //     } catch (e) {
    //       console.log("Browser already closed");
    //     }
    //   }, 60000); // Close after 1 minute

    //   return NextResponse.json({ 
    //     success: false, 
    //     requiresManualVerification: true,
    //     message: "Manual security verification required. Please complete it in the browser." 
    //   }, { status: 200 });
    // }

    // Check if login was successful
    const isLoginSuccessful = await page.evaluate(() => {
      const isOnFacebook = window.location.hostname.includes('facebook.com');
      const isNotOnLogin = !window.location.pathname.includes('login');
      const hasMainContent = !!(document.querySelector('[role="main"]') || 
                               document.querySelector('[data-testid="blue_bar_profile_link"]') ||
                               document.querySelector('[data-testid="Keycommand_wrapper_CloseFriends"]'));
      
      return isOnFacebook && isNotOnLogin && hasMainContent;
    });

    if (isLoginSuccessful) {
      console.log("Login successful!");
      await browser.close();
      return NextResponse.json({ 
        success: true, 
        message: "Login successful!" 
      });
    } else {
      await browser.close();
      return NextResponse.json({ 
        success: false, 
        message: "Login failed - please check credentials" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Login failed:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.log("Error closing browser:", e);
      }
    }
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}