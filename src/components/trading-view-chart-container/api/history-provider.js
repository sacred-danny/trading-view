var rp = require("request-promise").defaults({ json: true });

const api_root = "https://min-api.cryptocompare.com";
const history = {};

export default {
  history: history,

  getBars: function (symbolInfo, resolution, from, to, first, limit) {
    var split_symbol = symbolInfo.name.split(/[:/]/);
    const url =
      resolution === "D"
        ? "/data/histoday"
        : resolution >= 60
        ? "/data/histohour"
        : "/data/histominute";
    const qs = {
      e: "CCCAGG",
      fsym: split_symbol[1],
      tsym: split_symbol[2],
      toTs: to ? to : "",
      limit: limit ? limit : 2000,
      // aggregate: 1//resolution
    };
    console.log({ qs });
    console.log(`${api_root}${url}`, qs);

    return rp({
      url: `${api_root}${url}?api_key=9a1d569de187e85c4ef849fd73d0feb7cd1f5e6165b3e94329819fdb641f0f4c`,
      qs,
    }).then((data) => {
      console.log({ data });
      if (data.Response && data.Response === "Error") {
        console.log("CryptoCompare API error:", data.Message);
        return [];
      }
      if (data.Data.length) {
        console.log(
          `Actually returned: ${new Date(
            data.TimeFrom * 1000
          ).toISOString()} - ${new Date(data.TimeTo * 1000).toISOString()}`
        );
        var bars = data.Data.map((el) => {
          return {
            time: el.time * 1000, //TradingView requires bar time in ms
            low: el.low,
            high: el.high,
            open: el.open,
            close: el.close,
            volume: el.volumefrom,
          };
        });
        if (first) {
          var lastBar = bars[bars.length - 1];
          history[symbolInfo.name] = { lastBar: lastBar };
        }
        return bars;
      } else {
        return [];
      }
    });
  },
};