export default function prependZeroes(item , req_len) {
        if(item === undefined || item === null) {
        return null;
        }
        let res = item.toString()
        if(res.length >= req_len) {
        return item;
        }

        let zeroes_neeeded = req_len - res.length
        while(zeroes_neeeded) {
        zeroes_neeeded--;
        res = "0" + res;
        }

        return res
  }