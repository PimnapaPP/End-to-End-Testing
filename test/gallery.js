const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const iPhone = devices["iPhone 6"];
let page;
let browser;
const timeout = 100000;

let topic = "sport";
let newsID = "753185";
let currentImgID = "597965";
let nextImgID = "597969";
let prevImgID = "598001";

const imgIndex = "2 / 10";

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });
  page = await browser.newPage();
});

function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

async function gotoSingleImgOrGallery(option = "") {
  let link = "";
  option === "singleImg"
    ? (link = `https://www.sanook.com/sport/${newsID}/gallery/${currentImgID}/`)
    : (link = `//www.sanook.com/sport/${newsID}/gallery/`);
  await page.emulate(iPhone);
  await page.goto(`https://www.sanook.com/${topic}/${newsID}/`, {
    waitUntil: "domcontentloaded"
  });
  await delay(3000);
  await page.waitForSelector(`[href='${link}']`);
  let target = await page.$(`[href='${link}']`);
  await invokeTarget(target);
}

async function invokeTarget(target) {
  await target.click();
}

async function gotoNextOrPrevImg(option = "") {
  let button = "";
  option === "next"
    ? (button = ".ril-next-button")
    : (button = ".ril-prev-button");
  await delay(1500);
  await page.waitForSelector(button);
  console.log(
    option + "--------------------------------------------" + page.url()
  );
  await page.click(button);
}

async function gotoImgInGallery() {
  await delay(3000);
  await page.waitForSelector(".MobileGalleryAlbumList");
  let gotoGal = await page.$(".MobileGalleryAlbumList");
  console.log(gotoGal._remoteObject.description);

  let photos = await page.$$(".colItem.col-4.col-sm-2");
  await photos[0].click();
}
async function findImgIndex() {
  await delay(3000);
  console.log("findIndex+++++++++++++++++++++++++++++++++++" + page.url());
  await page.waitForSelector(".MobileGallery__header");
  let counter = await page.$eval(
    ".MobileGallery__header div.count",
    el => el.innerHTML
  );
  return await counter;
}

describe("Entry Gallery Page", () => {
  console.log(
    "++++++++++++++++++++++++Entry Gallery Page++++++++++++++++++++++++++++++++++"
  );
  test(
    "should click photo correctly",
    async () => {
      console.log("should click photo correctly");
      await gotoSingleImgOrGallery("singleImg");
      await page.waitForSelector(".ril-image-current");
      expect(page.url()).toBe(
        `https://www.sanook.com/sport/${newsID}/gallery/${currentImgID}/`
      );

      browser.close();
    },
    timeout
  );

  test(
    "should click gallery page correctly",
    async () => {
      console.log("should click gallery page correctly");
      await gotoSingleImgOrGallery("gallery");
      await page.waitForSelector(".MobileGalleryAlbumPage");
      let galleryPage = page.url();
      expect(galleryPage).toBe(
        `https://www.sanook.com/sport/${newsID}/gallery/`
      );
      browser.close();
    },
    timeout
  );

  describe("photo in entry page", () => {
    test(
      "should click next photo correctly",
      async () => {
        console.log("should click next photo correctly");
        await gotoSingleImgOrGallery("singleImg");
        await gotoNextOrPrevImg("next");
        await page.waitForSelector(".ril-image-current");
        expect(page.url()).toBe(
          `https://www.sanook.com/sport/${newsID}/gallery/${nextImgID}/`
        );
        browser.close();
      },
      timeout
    );

    test(
      "should click previous photo correctly",
      async () => {
        console.log("should click previous photo correctly");
        await gotoSingleImgOrGallery("singleImg");
        await gotoNextOrPrevImg("prev");
        await page.waitForSelector(".ril-image-current");
        expect(page.url()).toBe(
          `https://www.sanook.com/sport/${newsID}/gallery/${prevImgID}/`
        );
        browser.close();
      },
      timeout
    );
  });
});

describe("Gallery Page", () => {
  console.log("+++++++++++++++++++++++Gallery Page++++++++++++++++++++++++++");
  test(
    "should click photo correctly",
    async () => {
      console.log("should click photo correctly");
      await gotoSingleImgOrGallery("gallery");
      await gotoImgInGallery();
      await page.waitForSelector(".ril-image-current");
      expect(page.url()).toBe(
        "https://www.sanook.com/sport/753185/gallery/597965/"
      );
      browser.close();
    },
    timeout
  );

  describe("photo in gallery page", () => {
    test(
      "should change index correctly when change photo ",
      async () => {
        console.log("should change index correctly when change photo");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await gotoNextOrPrevImg("next");
        await page.waitForSelector(".ril-image-current");
        let counter = await findImgIndex();
        expect(counter).toBe(imgIndex);
        browser.close();
      },
      timeout
    );

    test(
      "should handle finger swipe correctly",
      async () => {
        console.log("should handle finger swipe correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".ril-image-current");
        console.log("finger swipe >>>>>>" + page.url());
        const innerWidth = await page.evaluate(() => window.innerWidth);
        const innerHeight = await page.evaluate(() => window.innerHeight);
        const mouse = page.mouse;
        await mouse.move(innerWidth / 2, innerHeight / 2);
        await mouse.down();
        await mouse.move(innerWidth / 2 - 300, innerHeight / 2);
        await mouse.up();
        await delay(1500);
        let counter = await findImgIndex();
        expect(counter).toBe("2 / 10");
        browser.close();
      },
      timeout
    );

    test(
      "should click X button & return gallery page correctly",
      async () => {
        console.log("should click X button & return gallery page correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".sn-icon--close");
        await page.click(".sn-icon--close");
        // await delay(1500);
        // await page.waitForSelector(".MobileGalleryAlbumList");
        expect(page.url()).toBe(
          `https://www.sanook.com/sport/${newsID}/gallery/`
        );
        browser.close();
      },
      timeout
    );

    test(
      "should show share button correctly",
      async () => {
        console.log("should show share button correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".share-button");
        let shareButton = await page.$(".share-button");
        expect(shareButton !== null).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should show shareBar correctly",
      async () => {
        console.log("should show shareBar correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".share-button");
        let shareButton = await page.$(".share-button");
        await shareButton.click();
        await page.waitForSelector(".EntryShare");
        let shareBar = await page.$(".EntryShare");
        expect(shareBar !== null).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should show shareBar with social icons correctly",
      async () => {
        console.log("should show shareBar with social icons correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".share-button");
        await page.click(".share-button");

        await page.waitForSelector(".EntryShare");
        let shareBar = await page.$(".EntryShare");
        let socialApp = await page.$eval(".social", social => social.innerHTML);
        let facebook = socialApp.search("facebook.com/share");
        let twitter = socialApp.search("twitter.com/intent/tweet");
        let google = socialApp.search("plus.google.com/share");
        let line = socialApp.search("line://msg/text/");

        expect(shareBar).not.toBe(undefined);
        expect(facebook !== -1).toBeTruthy();
        expect(twitter !== -1).toBeTruthy();
        expect(google !== -1).toBeTruthy();
        expect(line !== -1).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should handle pop up Ads correctly",
      async () => {
        console.log("should handle pop up Ads correctly");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await page.waitForSelector(".ril-image-current");
        for (let i = 0; i < 10; i++) {
          await gotoNextOrPrevImg("next");
          if (i === 9) {
            await page.waitForSelector(".MobileWallpaperAd");
          }
        }
        let popupAds = await page.$(".mobile-wallpaper__frame");
        expect(popupAds !== null).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should show Ads at footer",
      async () => {
        console.log("should show Ads at footer");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await delay(3000);

        await page.waitForSelector(".MobileGallery__footer iframe");
        let adWrapper = await page.$(".MobileGallery__footer iframe");
        expect(adWrapper !== null).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should change Ads when tap the screen",
      async () => {
        console.log("should change Ads when tap the screen");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await delay(1500);
        await page.waitForSelector(".MobileGallery");
        const innerWidth = await page.evaluate(() => {
          return window.innerWidth;
        });
        const innerHeight = await page.evaluate(() => {
          return window.innerHeight;
        });
        const tapper = await page.touchscreen;
        await tapper.tap(innerWidth / 2, innerHeight / 2);
        await delay(3000);
        let adWrapper = await page.$(".MobileGallery__footer iframe");
        expect(adWrapper === null).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should toggle header when tap",
      async () => {
        console.log("should toggle header when tap");
        await gotoSingleImgOrGallery("gallery");
        await gotoImgInGallery();
        await delay(1500);
        await page.waitForSelector(".MobileGallery");
        const innerWidth = await page.evaluate(() => {
          return window.innerWidth;
        });
        const innerHeight = await page.evaluate(() => {
          return window.innerHeight;
        });
        const tapper = await page.touchscreen;
        await delay(1500);
        await tapper.tap(innerWidth / 2, innerHeight / 2);
        await delay(1500);
        let header = await page.$(".MobileGallery__header");
        expect(header === null).toBeTruthy();
        browser.close();
      },
      timeout
    );
  });
});
