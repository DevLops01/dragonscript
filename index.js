const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());
const axios = require("axios");
const {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} = require("@nfteyez/sol-rayz");

const { mints } = require("./mints");

const csvWriter = require("csv-write-stream");

const fs = require("fs");

let columns = [
  "ID",
  "Class",
  "Affinity",
  "Spine",
  "Horns",
  "Neck",
  "Face",
  "Tusk",
  "Eye",
  "Visual",
  "Power",
  "Gene",
  "Rarity",
  "Rank",
  "Price",
  "Address",
  "Owned",
];

var writer = csvWriter({ headers: columns });

writer.pipe(fs.createWriteStream("./owned.csv"));

const stream = fs.createWriteStream(
  `./owned.csv`,
  {
    flags: "w",
  },
  columns
);

let owned = [];
let unHatched = [];

// Place NFT address to query here
const address = "AZMqBMP84iV3u5kSKT1wj4VTt3JUyUwinm7yXaw3BwPo";

const getPurchasedPrice = async (mintAddress) => {
  try {
    return await axios
      .get(
        `https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}/activities?offset=0&limit=50`
      )
      .then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].type === "buyNow") {
            return res.data[i].price;
          }
        }
      });
  } catch (e) {
    console.log(e);
  }
};

const getTextContent = async (page, xPath) => {
  const [el] = await page.$x(xPath);

  const src = await el.getProperty("textContent");

  return await src.jsonValue();
};

const init = async () => {
  const publicAddress = await resolveToWalletAddress({
    text: address,
  });

  const nftArray = await getParsedNftAccountsByOwner({
    publicAddress,
  });

  nftArray.forEach(async (nft, i) => {
    const run = async () => {
      let number = nft.data.name.split(" ")[2];
      let browser = await puppeteer.launch({ headless: true });
      let buyPrice;

      if (!nft.data.name.startsWith("Eternal Dragon")) return;

      //   Check if NFT is the correct NFT
      try {
        buyPrice = await getPurchasedPrice(nft.mint);

        //   Open site to fetch info
        const page = await browser.newPage();

        await page.goto(`https://eternaldragons.com/dragon/${nft.mint}`);

        await page.waitForXPath(
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[9]/div',
          { timeout: 2000 }
        );

        // Get visual rairity score
        let visual = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[9]/div/div[1]/div[2]'
        );

        // Get Power
        let power = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[9]/div/div[2]/div[2]'
        );

        // Get Gene Pool Value
        let gene = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[9]/div/div[3]/div[2]'
        );

        //  Get rarity
        let rarity = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[9]/div'
        );

        rarity = rarity.split("%")[3];
        rarity = rarity.substring(0, rarity.length - 2);
        rarity = rarity.split(":")[1];

        // get rank
        let rank = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[1]/div'
        );

        console.log(rank);

        // Get Class
        let Class = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[1]/div'
        );

        Class = Class.split("Class")[1];

        // Get Affinity
        let Affinity = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[2]/div'
        );

        Affinity = Affinity.split("Affinity")[1];

        // Get Spine
        let Spine = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[3]/div'
        );

        Spine = Spine.split("Spine")[1];

        // Get Horns
        let Horns = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[4]/div'
        );

        Horns = Horns.split("Horns")[1];

        // Get Neck
        let Neck = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[5]/div'
        );

        Neck = Neck.split("Neck")[1];

        // Get Face
        let Face = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[6]/div'
        );

        Face = Face.split("Face")[1];

        // Get Tusk
        let Tusk = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[7]/div'
        );

        Tusk = Tusk.split("Tusk")[1];

        // Get Eye
        let Eye = await getTextContent(
          page,
          '//*[@id="__next"]/div/div[1]/div/div/div/div/div[2]/div/div[3]/div[2]/div[8]/div'
        );

        Eye = Eye.split("Eye")[1];

        //   write to file
        // console.log(
        //   `Eternal Dragon ${number} | Affinity: ${Affinity} | Class: ${Class} | Rarity: ${rarity} | ${nft.mint}`
        // );

        // stream.write(
        //   `\nEternal Dragon ${number} | Affinity: ${Affinity} - Rank: ${rank} | Class: ${Class} | Rarity: ${rarity} | Price: ${buyPrice} | ${nft.mint}\n`
        // );

        // stream.write(
        //   `\r\nEternal Dragon ${number}, ${Affinity}, ${Class}, ${rarity}, ${rank}, ${buyPrice}, ${nft.mint}`
        // );

        writer.write([
          `${number}`,
          `${Class}`,
          `${Affinity}`,
          `${Spine}`,
          `${Horns}`,
          `${Neck}`,
          `${Face}`,
          `${Tusk}`,
          `${Eye}`,
          `${visual}`,
          `${power}`,
          `${gene}`,
          `${rarity}`,
          `${rank}`,
          `${buyPrice}`,
          `${nft.mint}`,
          `true`,
        ]);
      } catch (e) {
        // console.log(e.message);

        // stream.write(
        //   `\nEternal Dragon ${number} | Affinity: Unhatched | Class: Unhatched | Rarity: Unhatched - Rank: Unhatched | Price: ${buyPrice} | ${nft.mint}\n`
        // );

        writer.write([
          `${number}`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `Unhatched`,
          `${buyPrice}`,
          `${nft.mint}`,
          `true`,
        ]);
      } finally {
        await browser.close();

        if (i === nftArray.length) {
          console.log("Done with owned NFTs");

          writer.end();

          return;
        }
      }
    };

    // slowed down to avoid timeouts
    setTimeout(() => {
      run();
    }, 3000 * i);
  });

  return;
};

init();
