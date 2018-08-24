const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const iPhone = devices["iPhone 6"];
let page;
let browser;
const timeout = 100000;

const domainName = "http://10.66.6.58";
const topic = "sport";
const newsID = "753185";
const currentImgID = "597965";
const nextImgID = "597969";
const prevImgID = "598001";

const imgIndex = "2 / 10";
const imgIndex2 = "2<!-- --> / <!-- -->10";
const pickingImgAtIndex = "0";

const expectedCurrentImgSrcAfterClickNext =
  "//s.isanook.com/sp/0/ui/150/753185/5bce6842c7ac0eb195626f85ab6899f5_1531461694.jpg";
const expectedCurrentImgSrcAfterClickPrev =
  "//s.isanook.com/sp/0/ui/150/753185/0d80cf71a6a3bd98bd24983dd192638b_1531461697.jpg";

function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

async function gotoEntryOrGalleryPage(option = "") {
  let link = "";
  option === "entry"
    ? (link = `https://localhost:80/${topic}/${newsID}/gallery/${currentImgID}/`)
    : (link = `//localhost:80/${topic}/${newsID}/gallery/`);
  await page.emulate(iPhone);
  await page.goto(`${domainName}/${topic}/${newsID}/`, {
    waitUntil: "domcontentloaded"
  });
  await delay(3000);
  await page.waitForSelector(`[href='${link}']`);
  let target = await page.$(`[href='${link}']`);
  console.log(link);
  console.log(
    "###############################################",
    target._remoteObject.description
  );
  await invokeTarget(target);
}

async function gotoSingleImg() {
  await page.emulate(iPhone);
  let link = `${domainName}/${topic}/${newsID}/gallery/${currentImgID}/`;
  await page.goto(link, {
    waitUntil: "domcontentloaded"
  });
}

async function invokeTarget(target) {
  await target.click();
}

async function gotoNextOrPrevImg(option = "") {
  let button = "";
  option === "next"
    ? (button = ".pswp__button--arrow--right")
    : (button = ".pswp__button--arrow--left");
  await delay(1500);
  await page.waitForSelector(button);
  await page.click(button);
}

async function gotoImgInGallery() {
  await delay(3000);
  await page.waitForSelector(".MobileGalleryAlbumList");
  let photos = await page.$$(".colItem.col-4.col-sm-2");
  await photos[pickingImgAtIndex].click();
}

async function findImgIndex() {
  await delay(3000);
  await page.waitForSelector(".MobileGallery__header");
  let counter = await page.$eval(
    ".MobileGallery__header div.count",
    el => el.innerHTML
  );
  return await counter;
}

async function getSrcAttribute(element, target) {
  let imageSrc = await element.$eval(target, el => el.getAttribute("src"));
  return imageSrc;
}

async function getIdAttribute(element, target) {
  let imageSrc = await element.$eval(target, el => el.getAttribute("id"));
  return imageSrc;
}

describe("Entry Gallery Page", () => {
  console.log(
    "____________________________________________Entry_______________________________________________"
  );
  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 90
    });
    page = await browser.newPage();
  });
  test(
    "should click photo correctly",
    async () => {
      console.log("should click photo correctly");
      await gotoEntryOrGalleryPage("entry");
      await page.waitForSelector(".pswp__img");
      expect(page.url()).toBe(
        `${domainName}/${topic}/${newsID}/gallery/${currentImgID}/`
      );

      browser.close();
    },
    timeout
  );

  test(
    "should click gallery page correctly",
    async () => {
      console.log("should click gallery page correctly");
      await gotoEntryOrGalleryPage("gallery");
      await page.waitForSelector(".MobileGalleryAlbumPage");
      let galleryPage = page.url();
      expect(galleryPage).toBe(`${domainName}/${topic}/${newsID}/gallery/`);
      browser.close();
    },
    timeout
  );

  describe("photo in entry page", () => {
    test(
      "should click next photo correctly",
      async () => {
        await gotoSingleImg();
        await gotoNextOrPrevImg("next");
        await page.waitForSelector(".pswp__img");
        let photoItems = await page.$$(".pswp__item");
        let currentImageItem = await photoItems[2];
        let currentImageSrc = await currentImageItem.$eval("img", el =>
          el.getAttribute("src")
        );
        expect(page.url()).toBe(
          `${domainName}/${topic}/${newsID}/gallery/${nextImgID}/`
        );
        expect(currentImageSrc).toBe(expectedCurrentImgSrcAfterClickNext);
        browser.close();
      },
      timeout
    );
    test(
      "should click previous photo correctly",
      async () => {
        console.log("should click previous photo correctly");
        await gotoSingleImg();
        await gotoNextOrPrevImg("prev");
        await page.waitForSelector(".pswp__img");
        let photoItems = await page.$$(".pswp__item");
        let currentImageItem = await photoItems[1];
        let currentImageSrc = await currentImageItem.$eval("img", el =>
          el.getAttribute("src")
        );
        expect(page.url()).toBe(
          `${domainName}/${topic}/${newsID}/gallery/${prevImgID}/`
        );
        expect(currentImageSrc).toBe(expectedCurrentImgSrcAfterClickPrev);
        browser.close();
      },
      timeout
    );
    test(
      "should handle finger swipe correctly",
      async () => {
        console.log("should handle finger swipe correctly");
        await gotoSingleImg();
        await page.waitForSelector(".pswp__img");
        const innerWidth = await page.evaluate(() => window.innerWidth);
        const innerHeight = await page.evaluate(() => window.innerHeight);
        const mouse = page.mouse;
        await delay(1500);
        await mouse.move(innerWidth / 2, 100);
        await mouse.down();
        await mouse.move(innerWidth / 2 + 10, 100);
        await mouse.move(innerWidth / 2 - 300, 100);
        await mouse.up();
        await page.waitForSelector(".pswp__img");
        let counter = await findImgIndex();
        if (counter === imgIndex || counter === imgIndex2) {
          counter = true;
        } else {
          counter = false;
        }
        expect(counter).toBeTruthy();
        browser.close();
      },
      timeout
    );

    test(
      "should click X button & return gallery page correctly",
      async () => {
        console.log("should click X button & return gallery page correctly");
        await gotoEntryOrGalleryPage("entry");
        await page.waitForSelector(".sn-icon--close");
        await delay(3000);
        let mouse = await page.mouse;
        await mouse.click(370, 60);
        await page.waitForSelector(".sn-icon--close");
        await page.click(".sn-icon--close");
        await delay(1500);
        await page.waitForSelector(".EntryGalleryItem");
        expect(page.url()).toBe(`${domainName}/${topic}/${newsID}/`);
        browser.close();
      },
      timeout
    );
    test(
      "should show share button correctly",
      async () => {
        await gotoEntryOrGalleryPage("entry");
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
        await gotoSingleImg();
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
        await gotoSingleImg();
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
        await gotoSingleImg();
        await page.waitForSelector(".pswp__img");
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
        await gotoSingleImg();
        await delay(10000);
        await page.waitForSelector(".MobileGallery__footer iframe");
        let adWrapper = await page.$(".MobileGallery__footer iframe");
        expect(adWrapper !== null).toBeTruthy();
        browser.close();
      },
      timeout
    );
    test(
      "should toggle Ads when tap the screen",
      async () => {
        console.log("should toggle Ads when tap the screen");
        await gotoSingleImg();
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
        await gotoSingleImg();
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
    test(
      "should refresh Ads",
      async () => {
        console.log("should change Ads when tap the screen");
        await gotoSingleImg();
        await delay(10000);
        await page.waitForSelector(".MobileGallery__footer iframe");
        let idAd1 = await getIdAttribute(page, ".MobileGallery__footer iframe");
        console.log("id", idAd1);
        await delay(25000);
        let idAd2 = await getIdAttribute(page, ".MobileGallery__footer iframe");
        console.log(idAd2);
        await delay(35000);
        let idAd3 = await getIdAttribute(page, ".MobileGallery__footer iframe");
        console.log(idAd3);
        expect(idAd2 !== idAd3).toBeTruthy();
        browser.close();
      },
      timeout
    );
  });
});

describe("Gallery Page", () => {
  //   ("____________________________________________Gallery_______________________________________________");
  // beforeEach(async () => {
  //   browser = await puppeteer.launch({
  //     headless: false,
  //     slowMo: 50
  //   });
  //   page = await browser.newPage();
  // });
  // test(
  //   "should click photo correctly",
  //   async () => {
  //     console.log("should click photo correctly");
  //     await page.emulate(iPhone);
  //     await page.goto(`${domainName}/${topic}/${newsID}/gallery/`, {
  //       waitUntil: "domcontentloaded"
  //     });
  //     await gotoImgInGallery();
  //     await page.waitForSelector(".pswp__img");
  //     expect(page.url()).toBe(
  //       `${domainName}/${topic}/${newsID}/gallery/${currentImgID}/`
  //     );
  //     browser.close();
  //   },
  //   timeout
  // );
  // describe("photo in gallery page", () => {
  // test(
  //   "should change index correctly when change photo ",
  //   async () => {
  //     console.log("should change index correctly when change photo");
  //     await gotoSingleImg();
  //     await gotoNextOrPrevImg("next");
  //     await page.waitForSelector(".pswp__img");
  //     let counter = await findImgIndex();
  //     if (counter === imgIndex || counter === imgIndex2) {
  //       counter = true;
  //     } else {
  //       counter = false;
  //     }
  //     expect(counter).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should click next photo correctly",
  //   async () => {
  //     console.log("should click photo correctly");
  //     await gotoSingleImg();
  //     await gotoNextOrPrevImg("next");
  //     await page.waitForSelector(".pswp__img");
  //     let photoItems = await page.$$(".pswp__item");
  //     let currentImageItem = await photoItems[2];
  //     let currentImageSrc = await currentImageItem.$eval("img", el =>
  //       el.getAttribute("src")
  //     );
  //     expect(page.url()).toBe(
  //       `${domainName}/${topic}/${newsID}/gallery/${nextImgID}/`
  //     );
  //     expect(currentImageSrc).toBe(expectedCurrentImgSrcAfterClickNext);
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should click previous photo correctly",
  //   async () => {
  //     console.log("should click previous photo correctly");
  //     await gotoSingleImg();
  //     await gotoNextOrPrevImg("prev");
  //     await page.waitForSelector(".pswp__img");
  //     let photoItems = await page.$$(".pswp__item");
  //     let currentImageItem = await photoItems[1];
  //     let currentImageSrc = await currentImageItem.$eval("img", el =>
  //       el.getAttribute("src")
  //     );
  //     expect(page.url()).toBe(
  //       `${domainName}/${topic}/${newsID}/gallery/${prevImgID}/`
  //     );
  //     expect(currentImageSrc).toBe(expectedCurrentImgSrcAfterClickPrev);
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should handle finger swipe correctly",
  //   async () => {
  //     console.log("should handle finger swipe correctly");
  //     await gotoSingleImg();
  //     await page.waitForSelector(".pswp__img");
  //     const innerWidth = await page.evaluate(() => window.innerWidth);
  //     const innerHeight = await page.evaluate(() => window.innerHeight);
  //     const mouse = page.mouse;
  //     await delay(1500);
  //     await mouse.move(innerWidth / 2, 100);
  //     await mouse.down();
  //     await mouse.move(innerWidth / 2 + 10, 100);
  //     await mouse.move(innerWidth / 2 - 300, 100);
  //     await mouse.up();
  //     await page.waitForSelector(".pswp__img");
  //     let counter = await findImgIndex();
  //     if (counter === imgIndex || counter === imgIndex2) {
  //       counter = true;
  //     } else {
  //       counter = false;
  //     }
  //     expect(counter).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  //     // Link are the same for both entry
  //     test(
  //       "should click X button & return gallery page correctly",
  //       async () => {
  //         console.log("should click X button & return gallery page correctly");
  //         await gotoSingleImg();
  //         await page.waitForSelector(".sn-icon--close");
  //         let mouse = await page.mouse;
  //         await mouse.click(370, 60);
  //         await page.waitForSelector(".sn-icon--close");
  //         await page.click(".sn-icon--close");
  //         await delay(3000);
  //         await page.waitForSelector(".MobileGalleryAlbumList");
  //         expect(page.url()).toBe(`${domainName}/${topic}/${newsID}/gallery/`);
  //         browser.close();
  //       },
  //       timeout
  //     );
  // test(
  //   "should show share button correctly",
  //   async () => {
  //     await gotoSingleImg();
  //     await page.waitForSelector(".share-button");
  //     let shareButton = await page.$(".share-button");
  //     expect(shareButton !== null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should show shareBar correctly",
  //   async () => {
  //     console.log("should show shareBar correctly");
  //     await gotoSingleImg();
  //     await page.waitForSelector(".share-button");
  //     let shareButton = await page.$(".share-button");
  //     await shareButton.click();
  //     await page.waitForSelector(".EntryShare");
  //     let shareBar = await page.$(".EntryShare");
  //     expect(shareBar !== null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should show shareBar with social icons correctly",
  //   async () => {
  //     console.log("should show shareBar with social icons correctly");
  //     await gotoSingleImg();
  //     await page.waitForSelector(".share-button");
  //     await page.click(".share-button");
  //     await page.waitForSelector(".EntryShare");
  //     let shareBar = await page.$(".EntryShare");
  //     let socialApp = await page.$eval(".social", social => social.innerHTML);
  //     let facebook = socialApp.search("facebook.com/share");
  //     let twitter = socialApp.search("twitter.com/intent/tweet");
  //     let google = socialApp.search("plus.google.com/share");
  //     let line = socialApp.search("line://msg/text/");
  //     expect(shareBar).not.toBe(undefined);
  //     expect(facebook !== -1).toBeTruthy();
  //     expect(twitter !== -1).toBeTruthy();
  //     expect(google !== -1).toBeTruthy();
  //     expect(line !== -1).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should handle pop up Ads correctly",
  //   async () => {
  //     console.log("should handle pop up Ads correctly");
  //     await gotoSingleImg();
  //     await page.waitForSelector(".pswp__img");
  //     for (let i = 0; i < 10; i++) {
  //       await gotoNextOrPrevImg("next");
  //       if (i === 9) {
  //         await page.waitForSelector(".MobileWallpaperAd");
  //       }
  //     }
  //     let popupAds = await page.$(".mobile-wallpaper__frame");
  //     expect(popupAds !== null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should show Ads at footer",
  //   async () => {
  //     console.log("should show Ads at footer");
  //     await gotoSingleImg();
  //     await delay(10000);
  //     await page.waitForSelector(".MobileGallery__footer iframe");
  //     let adWrapper = await page.$(".MobileGallery__footer iframe");
  //     expect(adWrapper !== null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should toggle Ads when tap the screen",
  //   async () => {
  //     console.log("should change Ads when tap the screen");
  //     await gotoSingleImg();
  //     await delay(1500);
  //     await page.waitForSelector(".MobileGallery");
  //     const innerWidth = await page.evaluate(() => {
  //       return window.innerWidth;
  //     });
  //     const innerHeight = await page.evaluate(() => {
  //       return window.innerHeight;
  //     });
  //     const tapper = await page.touchscreen;
  //     await delay(1500);
  //     await tapper.tap(innerWidth / 2, innerHeight / 2);
  //     await delay(3000);
  //     let adWrapper = await page.$(".MobileGallery__footer iframe");
  //     expect(adWrapper === null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should toggle header when tap",
  //   async () => {
  //     console.log("should toggle header when tap");
  //     await gotoSingleImg();
  //     await delay(1500);
  //     await page.waitForSelector(".MobileGallery");
  //     const innerWidth = await page.evaluate(() => {
  //       return window.innerWidth;
  //     });
  //     const innerHeight = await page.evaluate(() => {
  //       return window.innerHeight;
  //     });
  //     const tapper = await page.touchscreen;
  //     await delay(1500);
  //     await tapper.tap(innerWidth / 2, innerHeight / 2);
  //     await delay(1500);
  //     let header = await page.$(".MobileGallery__header");
  //     expect(header === null).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // test(
  //   "should refresh Ads",
  //   async () => {
  //     console.log("should change Ads when tap the screen");
  //     await gotoSingleImg();
  //     await delay(10000);
  //     await page.waitForSelector(".MobileGallery__footer iframe");
  //     let idAd1 = await getIdAttribute(page, ".MobileGallery__footer iframe");
  //     console.log("id", idAd1);
  //     await delay(25000);
  //     let idAd2 = await getIdAttribute(page, ".MobileGallery__footer iframe");
  //     console.log(idAd2);
  //     await delay(35000);
  //     let idAd3 = await getIdAttribute(page, ".MobileGallery__footer iframe");
  //     console.log(idAd3);
  //     expect(idAd2 !== idAd3).toBeTruthy();
  //     browser.close();
  //   },
  //   timeout
  // );
  // });
});
