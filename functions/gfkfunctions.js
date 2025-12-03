export function netwgt_1(wetwgt_2, wetwgt, tarewgt, drywgt) {
    let netwgt_1 = 0
    if (Number(wetwgt_2) > 0) {
        netwgt_1 = (Number(wetwgt) - Number(tarewgt)) / (1 + calcmoist(drywgt, tarewgt, wetwgt, wetwgt_2))

    }
    return netwgt_1;
}
export function netwgt(drywgt, tarewgt) {
    if (Number(drywgt) && Number(tarewgt) > 0) {
        return (Number(drywgt) - Number(tarewgt));
    } else {
        return 0;
    }
}

export function calcdryden(wetwgt_2, wetwgt, tarewgt, drywgt, diameter, samplelength) {
    let netweight = 0;
    if (Number(wetwgt_2) > 0) {
        netweight = netwgt_1(wetwgt_2, wetwgt, tarewgt, drywgt)
    } else {
        netweight = netwgt(drywgt, tarewgt);
    }
    if (netweight > 0 && diameter > 0 && samplelength > 0) {
        return Math.round(Number((netweight / (.25 * Math.pow(Number(diameter), 2) * Math.PI * Number(samplelength))) * (1 / 453.592) * (144 * 12)))
    } else {
        return 0;
    }
}

export function calcmoist(drywgt, tarewgt, wetwgt, wetwgt_2) {
    let wgtwater = 0;
    let netweight = Number(drywgt) - Number(tarewgt)

    if (Number(wetwgt_2) > 0) {
        wgtwater = Number(wetwgt_2) - Number(drywgt)

    } else {
        wgtwater = Number(wetwgt) - Number(drywgt);

    }
    if ((wgtwater / netweight) > 0) {
        return (wgtwater / netweight)
    } else {
        return 0;
    }

}

export function loadChart() {
    return ([
        {
            dial: "1",
            loadlbs: "0.3"
        },
        {
            dial: "2",
            loadlbs: "0.7"
        },
        {
            dial: "3",
            loadlbs: "1.0"
        },
        {
            dial: "4",
            loadlbs: "1.3"
        },
        {
            dial: "5",
            loadlbs: "1.7"
        },
        {
            dial: "6",
            loadlbs: "2.0"
        },
        {
            dial: "7",
            loadlbs: "2.3"
        },
        {
            dial: "8",
            loadlbs: "2.7"
        },
        {
            dial: "9",
            loadlbs: "3.0"
        },
        {
            dial: "10",
            loadlbs: "3.3"
        },
        {
            dial: "11",
            loadlbs: "3.7"
        },
        {
            dial: "12",
            loadlbs: "4.0"
        },
        {
            dial: "13",
            loadlbs: "4.3"
        },
        {
            dial: "14",
            loadlbs: "4.7"
        },
        {
            dial: "15",
            loadlbs: "5.0"
        },
        {
            dial: "16",
            loadlbs: "5.3"
        },
        {
            dial: "17",
            loadlbs: "5.7"
        },
        {
            dial: "18",
            loadlbs: "6.0"
        },
        {
            dial: "19",
            loadlbs: "6.3"
        },
        {
            dial: "20",
            loadlbs: "6.7"
        },
        {
            dial: "21",
            loadlbs: "7.0"
        },
        {
            dial: "22",
            loadlbs: "7.3"
        },
        {
            dial: "23",
            loadlbs: "7.7"
        },
        {
            dial: "24",
            loadlbs: "8.0"
        },
        {
            dial: "25",
            loadlbs: "8.3"
        },
        {
            dial: "26",
            loadlbs: "8.7"
        },
        {
            dial: "27",
            loadlbs: "9.0"
        },
        {
            dial: "28",
            loadlbs: "9.3"
        },
        {
            dial: "29",
            loadlbs: "9.7"
        },
        {
            dial: "30",
            loadlbs: "10.0"
        },
        {
            dial: "31",
            loadlbs: "10.3"
        },
        {
            dial: "32",
            loadlbs: "10.7"
        },
        {
            dial: "33",
            loadlbs: "11.0"
        },
        {
            dial: "34",
            loadlbs: "11.3"
        },
        {
            dial: "35",
            loadlbs: "11.7"
        },
        {
            dial: "36",
            loadlbs: "12.0"
        },
        {
            dial: "37",
            loadlbs: "12.3"
        },
        {
            dial: "38",
            loadlbs: "12.7"
        },
        {
            dial: "39",
            loadlbs: "13.0"
        },
        {
            dial: "40",
            loadlbs: "13.3"
        },
        {
            dial: "41",
            loadlbs: "13.7"
        },
        {
            dial: "42",
            loadlbs: "14.0"
        },
        {
            dial: "43",
            loadlbs: "14.3"
        },
        {
            dial: "44",
            loadlbs: "14.7"
        },
        {
            dial: "45",
            loadlbs: "15.0"
        },
        {
            dial: "46",
            loadlbs: "15.3"
        },
        {
            dial: "47",
            loadlbs: "15.7"
        },
        {
            dial: "48",
            loadlbs: "16.0"
        },
        {
            dial: "49",
            loadlbs: "16.3"
        },
        {
            dial: "50",
            loadlbs: "16.7"
        },
        {
            dial: "51",
            loadlbs: "17.0"
        },
        {
            dial: "52",
            loadlbs: "17.3"
        },
        {
            dial: "53",
            loadlbs: "17.7"
        },
        {
            dial: "54",
            loadlbs: "18.0"
        },
        {
            dial: "55",
            loadlbs: "18.3"
        },
        {
            dial: "56",
            loadlbs: "18.7"
        },
        {
            dial: "57",
            loadlbs: "19.0"
        },
        {
            dial: "58",
            loadlbs: "19.3"
        },
        {
            dial: "59",
            loadlbs: "19.7"
        },
        {
            dial: "60",
            loadlbs: "20.0"
        },
        {
            dial: "61",
            loadlbs: "20.3"
        },
        {
            dial: "62",
            loadlbs: "20.7"
        },
        {
            dial: "63",
            loadlbs: "21.0"
        },
        {
            dial: "64",
            loadlbs: "21.3"
        },
        {
            dial: "65",
            loadlbs: "21.7"
        },
        {
            dial: "66",
            loadlbs: "22.0"
        },
        {
            dial: "67",
            loadlbs: "22.3"
        },
        {
            dial: "68",
            loadlbs: "22.7"
        },
        {
            dial: "69",
            loadlbs: "23.0"
        },
        {
            dial: "70",
            loadlbs: "23.3"
        },
        {
            dial: "71",
            loadlbs: "23.7"
        },
        {
            dial: "72",
            loadlbs: "24.0"
        },
        {
            dial: "73",
            loadlbs: "24.3"
        },
        {
            dial: "74",
            loadlbs: "24.7"
        },
        {
            dial: "75",
            loadlbs: "25.0"
        },
        {
            dial: "76",
            loadlbs: "25.3"
        },
        {
            dial: "77",
            loadlbs: "25.7"
        },
        {
            dial: "78",
            loadlbs: "26.0"
        },
        {
            dial: "79",
            loadlbs: "26.3"
        },
        {
            dial: "80",
            loadlbs: "26.7"
        },
        {
            dial: "81",
            loadlbs: "27.0"
        },
        {
            dial: "82",
            loadlbs: "27.3"
        },
        {
            dial: "83",
            loadlbs: "27.7"
        },
        {
            dial: "84",
            loadlbs: "28.0"
        },
        {
            dial: "85",
            loadlbs: "28.3"
        },
        {
            dial: "86",
            loadlbs: "28.7"
        },
        {
            dial: "87",
            loadlbs: "29.0"
        },
        {
            dial: "88",
            loadlbs: "29.3"
        },
        {
            dial: "89",
            loadlbs: "29.7"
        },
        {
            dial: "90",
            loadlbs: "30.0"
        },
        {
            dial: "91",
            loadlbs: "30.3"
        },
        {
            dial: "92",
            loadlbs: "30.7"
        },
        {
            dial: "93",
            loadlbs: "31.0"
        },
        {
            dial: "94",
            loadlbs: "31.3"
        },
        {
            dial: "95",
            loadlbs: "31.7"
        },
        {
            dial: "96",
            loadlbs: "32.0"
        },
        {
            dial: "97",
            loadlbs: "32.3"
        },
        {
            dial: "98",
            loadlbs: "32.7"
        },
        {
            dial: "99",
            loadlbs: "33.0"
        },
        {
            dial: "100",
            loadlbs: "33.3"
        },
        {
            dial: "101",
            loadlbs: "33.7"
        },
        {
            dial: "102",
            loadlbs: "34.0"
        },
        {
            dial: "103",
            loadlbs: "34.3"
        },
        {
            dial: "104",
            loadlbs: "34.7"
        },
        {
            dial: "105",
            loadlbs: "35.0"
        },
        {
            dial: "106",
            loadlbs: "35.3"
        },
        {
            dial: "107",
            loadlbs: "35.7"
        },
        {
            dial: "108",
            loadlbs: "36.0"
        },
        {
            dial: "109",
            loadlbs: "36.3"
        },
        {
            dial: "110",
            loadlbs: "36.7"
        },
        {
            dial: "111",
            loadlbs: "37.0"
        },
        {
            dial: "112",
            loadlbs: "37.3"
        },
        {
            dial: "113",
            loadlbs: "37.7"
        },
        {
            dial: "114",
            loadlbs: "38.0"
        },
        {
            dial: "115",
            loadlbs: "38.3"
        },
        {
            dial: "116",
            loadlbs: "38.7"
        },
        {
            dial: "117",
            loadlbs: "39.0"
        },
        {
            dial: "118",
            loadlbs: "39.3"
        },
        {
            dial: "119",
            loadlbs: "39.7"
        },
        {
            dial: "120",
            loadlbs: "40.0"
        },
        {
            dial: "121",
            loadlbs: "40.3"
        },
        {
            dial: "122",
            loadlbs: "40.7"
        },
        {
            dial: "123",
            loadlbs: "41.0"
        },
        {
            dial: "124",
            loadlbs: "41.3"
        },
        {
            dial: "125",
            loadlbs: "41.7"
        },
        {
            dial: "126",
            loadlbs: "42.0"
        },
        {
            dial: "127",
            loadlbs: "42.3"
        },
        {
            dial: "128",
            loadlbs: "42.7"
        },
        {
            dial: "129",
            loadlbs: "43.0"
        },
        {
            dial: "130",
            loadlbs: "43.3"
        },
        {
            dial: "131",
            loadlbs: "43.7"
        },
        {
            dial: "132",
            loadlbs: "44.0"
        },
        {
            dial: "133",
            loadlbs: "44.3"
        },
        {
            dial: "134",
            loadlbs: "44.7"
        },
        {
            dial: "135",
            loadlbs: "45.0"
        },
        {
            dial: "136",
            loadlbs: "45.3"
        },
        {
            dial: "137",
            loadlbs: "45.7"
        },
        {
            dial: "138",
            loadlbs: "46.0"
        },
        {
            dial: "139",
            loadlbs: "46.3"
        },
        {
            dial: "140",
            loadlbs: "46.7"
        },
        {
            dial: "141",
            loadlbs: "47.0"
        },
        {
            dial: "142",
            loadlbs: "47.3"
        },
        {
            dial: "143",
            loadlbs: "47.7"
        },
        {
            dial: "144",
            loadlbs: "48.0"
        },
        {
            dial: "145",
            loadlbs: "48.3"
        },
        {
            dial: "146",
            loadlbs: "48.7"
        },
        {
            dial: "147",
            loadlbs: "49.0"
        },
        {
            dial: "148",
            loadlbs: "49.3"
        },
        {
            dial: "149",
            loadlbs: "49.7"
        },
        {
            dial: "150",
            loadlbs: "50.0"
        },
        {
            dial: "151",
            loadlbs: "50.0"
        },
        {
            dial: "152",
            loadlbs: "50.0"
        },
        {
            dial: "153",
            loadlbs: "51.0"
        },
        {
            dial: "154",
            loadlbs: "51.0"
        },
        {
            dial: "155",
            loadlbs: "51.0"
        },
        {
            dial: "156",
            loadlbs: "52.0"
        },
        {
            dial: "157",
            loadlbs: "52.0"
        },
        {
            dial: "158",
            loadlbs: "52.0"
        },
        {
            dial: "159",
            loadlbs: "52.0"
        },
        {
            dial: "160",
            loadlbs: "53.0"
        },
        {
            dial: "161",
            loadlbs: "53.0"
        },
        {
            dial: "162",
            loadlbs: "53.0"
        },
        {
            dial: "163",
            loadlbs: "54.0"
        },
        {
            dial: "164",
            loadlbs: "54.0"
        },
        {
            dial: "165",
            loadlbs: "54.0"
        },
        {
            dial: "166",
            loadlbs: "55.0"
        },
        {
            dial: "167",
            loadlbs: "55.0"
        },
        {
            dial: "168",
            loadlbs: "55.0"
        },
        {
            dial: "169",
            loadlbs: "56.0"
        },
        {
            dial: "170",
            loadlbs: "56.0"
        },
        {
            dial: "171",
            loadlbs: "56.0"
        },
        {
            dial: "172",
            loadlbs: "57.0"
        },
        {
            dial: "173",
            loadlbs: "57.0"
        },
        {
            dial: "174",
            loadlbs: "57.0"
        },
        {
            dial: "175",
            loadlbs: "58.0"
        },
        {
            dial: "176",
            loadlbs: "58.0"
        },
        {
            dial: "177",
            loadlbs: "58.0"
        },
        {
            dial: "178",
            loadlbs: "58.0"
        },
        {
            dial: "179",
            loadlbs: "59.0"
        },
        {
            dial: "180",
            loadlbs: "59.0"
        },
        {
            dial: "181",
            loadlbs: "59.0"
        },
        {
            dial: "182",
            loadlbs: "60.0"
        },
        {
            dial: "183",
            loadlbs: "60.0"
        },
        {
            dial: "184",
            loadlbs: "60.0"
        },
        {
            dial: "185",
            loadlbs: "61.0"
        },
        {
            dial: "186",
            loadlbs: "61.0"
        },
        {
            dial: "187",
            loadlbs: "61.0"
        },
        {
            dial: "188",
            loadlbs: "62.0"
        },
        {
            dial: "189",
            loadlbs: "62.0"
        },
        {
            dial: "190",
            loadlbs: "62.0"
        },
        {
            dial: "191",
            loadlbs: "63.0"
        },
        {
            dial: "192",
            loadlbs: "63.0"
        },
        {
            dial: "193",
            loadlbs: "63.0"
        },
        {
            dial: "194",
            loadlbs: "64.0"
        },
        {
            dial: "195",
            loadlbs: "64.0"
        },
        {
            dial: "196",
            loadlbs: "64.0"
        },
        {
            dial: "197",
            loadlbs: "64.0"
        },
        {
            dial: "198",
            loadlbs: "65.0"
        },
        {
            dial: "199",
            loadlbs: "65.0"
        },
        {
            dial: "200",
            loadlbs: "65.0"
        },
        {
            dial: "201",
            loadlbs: "66.0"
        },
        {
            dial: "202",
            loadlbs: "66.0"
        },
        {
            dial: "203",
            loadlbs: "66.0"
        },
        {
            dial: "204",
            loadlbs: "67.0"
        },
        {
            dial: "205",
            loadlbs: "67.0"
        },
        {
            dial: "206",
            loadlbs: "67.0"
        },
        {
            dial: "207",
            loadlbs: "68.0"
        },
        {
            dial: "208",
            loadlbs: "68.0"
        },
        {
            dial: "209",
            loadlbs: "68.0"
        },
        {
            dial: "210",
            loadlbs: "69.0"
        },
        {
            dial: "211",
            loadlbs: "69.0"
        },
        {
            dial: "212",
            loadlbs: "69.0"
        },
        {
            dial: "213",
            loadlbs: "70.0"
        },
        {
            dial: "214",
            loadlbs: "70.0"
        },
        {
            dial: "215",
            loadlbs: "70.0"
        },
        {
            dial: "216",
            loadlbs: "70.0"
        },
        {
            dial: "217",
            loadlbs: "71.0"
        },
        {
            dial: "218",
            loadlbs: "71.0"
        },
        {
            dial: "219",
            loadlbs: "71.0"
        },
        {
            dial: "220",
            loadlbs: "72.0"
        },
        {
            dial: "221",
            loadlbs: "72.0"
        },
        {
            dial: "222",
            loadlbs: "72.0"
        },
        {
            dial: "223",
            loadlbs: "73.0"
        },
        {
            dial: "224",
            loadlbs: "73.0"
        },
        {
            dial: "225",
            loadlbs: "73.0"
        },
        {
            dial: "226",
            loadlbs: "74.0"
        },
        {
            dial: "227",
            loadlbs: "74.0"
        },
        {
            dial: "228",
            loadlbs: "74.0"
        },
        {
            dial: "229",
            loadlbs: "75.0"
        },
        {
            dial: "230",
            loadlbs: "75.0"
        },
        {
            dial: "231",
            loadlbs: "75.0"
        },
        {
            dial: "232",
            loadlbs: "75.0"
        },
        {
            dial: "233",
            loadlbs: "76.0"
        },
        {
            dial: "234",
            loadlbs: "76.0"
        },
        {
            dial: "235",
            loadlbs: "76.0"
        },
        {
            dial: "236",
            loadlbs: "77.0"
        },
        {
            dial: "237",
            loadlbs: "77.0"
        },
        {
            dial: "238",
            loadlbs: "77.0"
        },
        {
            dial: "239",
            loadlbs: "78.0"
        },
        {
            dial: "240",
            loadlbs: "78.0"
        },
        {
            dial: "241",
            loadlbs: "78.0"
        },
        {
            dial: "242",
            loadlbs: "79.0"
        },
        {
            dial: "243",
            loadlbs: "79.0"
        },
        {
            dial: "244",
            loadlbs: "79.0"
        },
        {
            dial: "245",
            loadlbs: "80.0"
        },
        {
            dial: "246",
            loadlbs: "80.0"
        },
        {
            dial: "247",
            loadlbs: "80.0"
        },
        {
            dial: "248",
            loadlbs: "81.0"
        },
        {
            dial: "249",
            loadlbs: "81.0"
        },
        {
            dial: "250",
            loadlbs: "81.0"
        },
        {
            dial: "251",
            loadlbs: "81.0"
        },
        {
            dial: "252",
            loadlbs: "82.0"
        },
        {
            dial: "253",
            loadlbs: "82.0"
        },
        {
            dial: "254",
            loadlbs: "82.0"
        },
        {
            dial: "255",
            loadlbs: "83.0"
        },
        {
            dial: "256",
            loadlbs: "83.0"
        },
        {
            dial: "257",
            loadlbs: "83.0"
        },
        {
            dial: "258",
            loadlbs: "84.0"
        },
        {
            dial: "259",
            loadlbs: "84.0"
        },
        {
            dial: "260",
            loadlbs: "84.0"
        },
        {
            dial: "261",
            loadlbs: "85.0"
        },
        {
            dial: "262",
            loadlbs: "85.0"
        },
        {
            dial: "263",
            loadlbs: "85.0"
        },
        {
            dial: "264",
            loadlbs: "86.0"
        },
        {
            dial: "265",
            loadlbs: "86.0"
        },
        {
            dial: "266",
            loadlbs: "86.0"
        },
        {
            dial: "267",
            loadlbs: "87.0"
        },
        {
            dial: "268",
            loadlbs: "87.0"
        },
        {
            dial: "269",
            loadlbs: "87.0"
        },
        {
            dial: "270",
            loadlbs: "87.0"
        },
        {
            dial: "271",
            loadlbs: "88.0"
        },
        {
            dial: "272",
            loadlbs: "88.0"
        },
        {
            dial: "273",
            loadlbs: "88.0"
        },
        {
            dial: "274",
            loadlbs: "89.0"
        },
        {
            dial: "275",
            loadlbs: "89.0"
        },
        {
            dial: "276",
            loadlbs: "89.0"
        },
        {
            dial: "277",
            loadlbs: "90.0"
        },
        {
            dial: "278",
            loadlbs: "90.0"
        },
        {
            dial: "279",
            loadlbs: "90.0"
        },
        {
            dial: "280",
            loadlbs: "91.0"
        },
        {
            dial: "281",
            loadlbs: "91.0"
        },
        {
            dial: "282",
            loadlbs: "91.0"
        },
        {
            dial: "283",
            loadlbs: "92.0"
        },
        {
            dial: "284",
            loadlbs: "92.0"
        },
        {
            dial: "285",
            loadlbs: "92.0"
        },
        {
            dial: "286",
            loadlbs: "93.0"
        },
        {
            dial: "287",
            loadlbs: "93.0"
        },
        {
            dial: "288",
            loadlbs: "93.0"
        },
        {
            dial: "289",
            loadlbs: "93.0"
        },
        {
            dial: "290",
            loadlbs: "94.0"
        },
        {
            dial: "291",
            loadlbs: "94.0"
        },
        {
            dial: "292",
            loadlbs: "94.0"
        },
        {
            dial: "293",
            loadlbs: "95.0"
        },
        {
            dial: "294",
            loadlbs: "95.0"
        },
        {
            dial: "295",
            loadlbs: "95.0"
        },
        {
            dial: "296",
            loadlbs: "96.0"
        },
        {
            dial: "297",
            loadlbs: "96.0"
        },
        {
            dial: "298",
            loadlbs: "96.0"
        },
        {
            dial: "299",
            loadlbs: "97.0"
        },
        {
            dial: "300",
            loadlbs: "97.0"
        },
        {
            dial: "301",
            loadlbs: "97.0"
        },
        {
            dial: "302",
            loadlbs: "98.0"
        },
        {
            dial: "303",
            loadlbs: "98.0"
        },
        {
            dial: "304",
            loadlbs: "98.0"
        },
        {
            dial: "305",
            loadlbs: "98.0"
        },
        {
            dial: "306",
            loadlbs: "99.0"
        },
        {
            dial: "307",
            loadlbs: "99.0"
        },
        {
            dial: "308",
            loadlbs: "99.0"
        },
        {
            dial: "309",
            loadlbs: "100.0"
        },
        {
            dial: "310",
            loadlbs: "100.0"
        },
        {
            dial: "311",
            loadlbs: "100.0"
        },
        {
            dial: "312",
            loadlbs: "101.0"
        },
        {
            dial: "313",
            loadlbs: "101.0"
        },
        {
            dial: "314",
            loadlbs: "101.0"
        },
        {
            dial: "315",
            loadlbs: "102.0"
        },
        {
            dial: "316",
            loadlbs: "102.0"
        },
        {
            dial: "317",
            loadlbs: "102.0"
        },
        {
            dial: "318",
            loadlbs: "103.0"
        },
        {
            dial: "319",
            loadlbs: "103.0"
        },
        {
            dial: "320",
            loadlbs: "103.0"
        },
        {
            dial: "321",
            loadlbs: "104.0"
        },
        {
            dial: "322",
            loadlbs: "104.0"
        },
        {
            dial: "323",
            loadlbs: "104.0"
        },
        {
            dial: "324",
            loadlbs: "104.0"
        },
        {
            dial: "325",
            loadlbs: "105.0"
        },
        {
            dial: "326",
            loadlbs: "105.0"
        },
        {
            dial: "327",
            loadlbs: "105.0"
        },
        {
            dial: "328",
            loadlbs: "106.0"
        },
        {
            dial: "329",
            loadlbs: "106.0"
        },
        {
            dial: "330",
            loadlbs: "106.0"
        },
        {
            dial: "331",
            loadlbs: "107.0"
        },
        {
            dial: "332",
            loadlbs: "107.0"
        },
        {
            dial: "333",
            loadlbs: "107.0"
        },
        {
            dial: "334",
            loadlbs: "108.0"
        },
        {
            dial: "335",
            loadlbs: "108.0"
        },
        {
            dial: "336",
            loadlbs: "108.0"
        },
        {
            dial: "337",
            loadlbs: "109.0"
        },
        {
            dial: "338",
            loadlbs: "109.0"
        },
        {
            dial: "339",
            loadlbs: "109.0"
        },
        {
            dial: "340",
            loadlbs: "110.0"
        },
        {
            dial: "341",
            loadlbs: "110.0"
        },
        {
            dial: "342",
            loadlbs: "110.0"
        },
        {
            dial: "343",
            loadlbs: "110.0"
        },
        {
            dial: "344",
            loadlbs: "111.0"
        },
        {
            dial: "345",
            loadlbs: "111.0"
        },
        {
            dial: "346",
            loadlbs: "111.0"
        },
        {
            dial: "347",
            loadlbs: "112.0"
        },
        {
            dial: "348",
            loadlbs: "112.0"
        },
        {
            dial: "349",
            loadlbs: "112.0"
        },
        {
            dial: "350",
            loadlbs: "113.0"
        },
        {
            dial: "351",
            loadlbs: "113.0"
        },
        {
            dial: "352",
            loadlbs: "113.0"
        },
        {
            dial: "353",
            loadlbs: "114.0"
        },
        {
            dial: "354",
            loadlbs: "114.0"
        },
        {
            dial: "355",
            loadlbs: "114.0"
        },
        {
            dial: "356",
            loadlbs: "115.0"
        },
        {
            dial: "357",
            loadlbs: "115.0"
        },
        {
            dial: "358",
            loadlbs: "115.0"
        },
        {
            dial: "359",
            loadlbs: "116.0"
        },
        {
            dial: "360",
            loadlbs: "116.0"
        },
        {
            dial: "361",
            loadlbs: "116.0"
        },
        {
            dial: "362",
            loadlbs: "116.0"
        },
        {
            dial: "363",
            loadlbs: "117.0"
        },
        {
            dial: "364",
            loadlbs: "117.0"
        },
        {
            dial: "365",
            loadlbs: "117.0"
        },
        {
            dial: "366",
            loadlbs: "118.0"
        },
        {
            dial: "367",
            loadlbs: "118.0"
        },
        {
            dial: "368",
            loadlbs: "118.0"
        },
        {
            dial: "369",
            loadlbs: "119.0"
        },
        {
            dial: "370",
            loadlbs: "119.0"
        },
        {
            dial: "371",
            loadlbs: "119.0"
        },
        {
            dial: "372",
            loadlbs: "120.0"
        },
        {
            dial: "373",
            loadlbs: "120.0"
        },
        {
            dial: "374",
            loadlbs: "120.0"
        },
        {
            dial: "375",
            loadlbs: "121.0"
        },
        {
            dial: "376",
            loadlbs: "121.0"
        },
        {
            dial: "377",
            loadlbs: "121.0"
        },
        {
            dial: "378",
            loadlbs: "121.0"
        },
        {
            dial: "379",
            loadlbs: "122.0"
        },
        {
            dial: "380",
            loadlbs: "122.0"
        },
        {
            dial: "381",
            loadlbs: "122.0"
        },
        {
            dial: "382",
            loadlbs: "123.0"
        },
        {
            dial: "383",
            loadlbs: "123.0"
        },
        {
            dial: "384",
            loadlbs: "123.0"
        },
        {
            dial: "385",
            loadlbs: "124.0"
        },
        {
            dial: "386",
            loadlbs: "125.0"
        },
        {
            dial: "387",
            loadlbs: "125.0"
        },
        {
            dial: "388",
            loadlbs: "126.0"
        },
        {
            dial: "389",
            loadlbs: "127.0"
        },
        {
            dial: "390",
            loadlbs: "128.0"
        },
        {
            dial: "391",
            loadlbs: "129.0"
        },
        {
            dial: "392",
            loadlbs: "129.0"
        },
        {
            dial: "393",
            loadlbs: "130.0"
        },
        {
            dial: "394",
            loadlbs: "131.0"
        },
        {
            dial: "395",
            loadlbs: "132.0"
        },
        {
            dial: "396",
            loadlbs: "132.0"
        },
        {
            dial: "397",
            loadlbs: "133.0"
        },
        {
            dial: "398",
            loadlbs: "134.0"
        },
        {
            dial: "399",
            loadlbs: "135.0"
        },
        {
            dial: "400",
            loadlbs: "136.0"
        },
        {
            dial: "401",
            loadlbs: "136.0"
        },
        {
            dial: "402",
            loadlbs: "137.0"
        },
        {
            dial: "403",
            loadlbs: "138.0"
        },
        {
            dial: "404",
            loadlbs: "139.0"
        },
        {
            dial: "405",
            loadlbs: "140.0"
        },
        {
            dial: "406",
            loadlbs: "140.0"
        },
        {
            dial: "407",
            loadlbs: "141.0"
        },
        {
            dial: "408",
            loadlbs: "142.0"
        },
        {
            dial: "409",
            loadlbs: "143.0"
        },
        {
            dial: "410",
            loadlbs: "143.0"
        },
        {
            dial: "411",
            loadlbs: "144.0"
        },
        {
            dial: "412",
            loadlbs: "145.0"
        },
        {
            dial: "413",
            loadlbs: "146.0"
        },
        {
            dial: "414",
            loadlbs: "147.0"
        },
        {
            dial: "415",
            loadlbs: "147.0"
        },
        {
            dial: "416",
            loadlbs: "148.0"
        },
        {
            dial: "417",
            loadlbs: "149.0"
        },
        {
            dial: "418",
            loadlbs: "150.0"
        },
        {
            dial: "419",
            loadlbs: "150.0"
        },
        {
            dial: "420",
            loadlbs: "151.0"
        },
        {
            dial: "421",
            loadlbs: "152.0"
        },
        {
            dial: "422",
            loadlbs: "153.0"
        },
        {
            dial: "423",
            loadlbs: "154.0"
        },
        {
            dial: "424",
            loadlbs: "154.0"
        },
        {
            dial: "425",
            loadlbs: "155.0"
        },
        {
            dial: "426",
            loadlbs: "156.0"
        },
        {
            dial: "427",
            loadlbs: "157.0"
        },
        {
            dial: "428",
            loadlbs: "157.0"
        },
        {
            dial: "429",
            loadlbs: "158.0"
        },
        {
            dial: "430",
            loadlbs: "159.0"
        },
        {
            dial: "431",
            loadlbs: "160.0"
        },
        {
            dial: "432",
            loadlbs: "161.0"
        },
        {
            dial: "433",
            loadlbs: "161.0"
        },
        {
            dial: "434",
            loadlbs: "162.0"
        },
        {
            dial: "435",
            loadlbs: "163.0"
        },
        {
            dial: "436",
            loadlbs: "164.0"
        },
        {
            dial: "437",
            loadlbs: "164.0"
        },
        {
            dial: "438",
            loadlbs: "165.0"
        },
        {
            dial: "439",
            loadlbs: "166.0"
        },
        {
            dial: "440",
            loadlbs: "167.0"
        },
        {
            dial: "441",
            loadlbs: "168.0"
        },
        {
            dial: "442",
            loadlbs: "168.0"
        },
        {
            dial: "443",
            loadlbs: "169.0"
        },
        {
            dial: "444",
            loadlbs: "170.0"
        },
        {
            dial: "445",
            loadlbs: "171.0"
        },
        {
            dial: "446",
            loadlbs: "171.0"
        },
        {
            dial: "447",
            loadlbs: "172.0"
        },
        {
            dial: "448",
            loadlbs: "173.0"
        },
        {
            dial: "449",
            loadlbs: "174.0"
        },
        {
            dial: "450",
            loadlbs: "175.0"
        },
        {
            dial: "451",
            loadlbs: "175.0"
        },
        {
            dial: "452",
            loadlbs: "176.0"
        },
        {
            dial: "453",
            loadlbs: "177.0"
        },
        {
            dial: "454",
            loadlbs: "178.0"
        },
        {
            dial: "455",
            loadlbs: "178.0"
        },
        {
            dial: "456",
            loadlbs: "179.0"
        },
        {
            dial: "457",
            loadlbs: "180.0"
        },
        {
            dial: "458",
            loadlbs: "181.0"
        },
        {
            dial: "459",
            loadlbs: "182.0"
        },
        {
            dial: "460",
            loadlbs: "182.0"
        },
        {
            dial: "461",
            loadlbs: "183.0"
        },
        {
            dial: "462",
            loadlbs: "184.0"
        },
        {
            dial: "463",
            loadlbs: "185.0"
        },
        {
            dial: "464",
            loadlbs: "185.0"
        },
        {
            dial: "465",
            loadlbs: "186.0"
        },
        {
            dial: "466",
            loadlbs: "187.0"
        },
        {
            dial: "467",
            loadlbs: "188.0"
        },
        {
            dial: "468",
            loadlbs: "189.0"
        },
        {
            dial: "469",
            loadlbs: "189.0"
        },
        {
            dial: "470",
            loadlbs: "190.0"
        },
        {
            dial: "471",
            loadlbs: "191.0"
        },
        {
            dial: "472",
            loadlbs: "192.0"
        },
        {
            dial: "473",
            loadlbs: "192.0"
        },
        {
            dial: "474",
            loadlbs: "193.0"
        },
        {
            dial: "475",
            loadlbs: "194.0"
        },
        {
            dial: "476",
            loadlbs: "195.0"
        },
        {
            dial: "477",
            loadlbs: "196.0"
        },
        {
            dial: "478",
            loadlbs: "196.0"
        },
        {
            dial: "479",
            loadlbs: "197.0"
        },
        {
            dial: "480",
            loadlbs: "198.0"
        },
        {
            dial: "481",
            loadlbs: "199.0"
        },
        {
            dial: "482",
            loadlbs: "199.0"
        },
        {
            dial: "483",
            loadlbs: "200.0"
        },
        {
            dial: "484",
            loadlbs: "201.0"
        },
        {
            dial: "485",
            loadlbs: "202.0"
        },
        {
            dial: "486",
            loadlbs: "203.0"
        },
        {
            dial: "487",
            loadlbs: "203.0"
        },
        {
            dial: "488",
            loadlbs: "204.0"
        },
        {
            dial: "489",
            loadlbs: "205.0"
        },
        {
            dial: "490",
            loadlbs: "206.0"
        },
        {
            dial: "491",
            loadlbs: "206.0"
        },
        {
            dial: "492",
            loadlbs: "207.0"
        },
        {
            dial: "493",
            loadlbs: "208.0"
        },
        {
            dial: "494",
            loadlbs: "209.0"
        },
        {
            dial: "495",
            loadlbs: "210.0"
        },
        {
            dial: "496",
            loadlbs: "210.0"
        },
        {
            dial: "497",
            loadlbs: "211.0"
        },
        {
            dial: "498",
            loadlbs: "212.0"
        },
        {
            dial: "499",
            loadlbs: "213.0"
        },
        {
            dial: "500",
            loadlbs: "213.0"
        },
        {
            dial: "501",
            loadlbs: "214.0"
        },
        {
            dial: "502",
            loadlbs: "215.0"
        },
        {
            dial: "503",
            loadlbs: "216.0"
        },
        {
            dial: "504",
            loadlbs: "217.0"
        },
        {
            dial: "505",
            loadlbs: "217.0"
        },
        {
            dial: "506",
            loadlbs: "218.0"
        },
        {
            dial: "507",
            loadlbs: "219.0"
        },
        {
            dial: "508",
            loadlbs: "220.0"
        },
        {
            dial: "509",
            loadlbs: "221.0"
        },
        {
            dial: "510",
            loadlbs: "221.0"
        },
        {
            dial: "511",
            loadlbs: "222.0"
        },
        {
            dial: "512",
            loadlbs: "223.0"
        },
        {
            dial: "513",
            loadlbs: "224.0"
        },
        {
            dial: "514",
            loadlbs: "224.0"
        },
        {
            dial: "515",
            loadlbs: "225.0"
        },
        {
            dial: "516",
            loadlbs: "226.0"
        },
        {
            dial: "517",
            loadlbs: "227.0"
        },
        {
            dial: "518",
            loadlbs: "228.0"
        },
        {
            dial: "519",
            loadlbs: "228.0"
        },
        {
            dial: "520",
            loadlbs: "229.0"
        },
        {
            dial: "521",
            loadlbs: "230.0"
        },
        {
            dial: "522",
            loadlbs: "231.0"
        },
        {
            dial: "523",
            loadlbs: "231.0"
        },
        {
            dial: "524",
            loadlbs: "232.0"
        },
        {
            dial: "525",
            loadlbs: "233.0"
        },
        {
            dial: "526",
            loadlbs: "234.0"
        },
        {
            dial: "527",
            loadlbs: "235.0"
        },
        {
            dial: "528",
            loadlbs: "235.0"
        },
        {
            dial: "529",
            loadlbs: "236.0"
        },
        {
            dial: "530",
            loadlbs: "237.0"
        },
        {
            dial: "531",
            loadlbs: "238.0"
        },
        {
            dial: "532",
            loadlbs: "238.0"
        },
        {
            dial: "533",
            loadlbs: "239.0"
        },
        {
            dial: "534",
            loadlbs: "240.0"
        },
        {
            dial: "535",
            loadlbs: "241.0"
        },
        {
            dial: "536",
            loadlbs: "242.0"
        },
        {
            dial: "537",
            loadlbs: "242.0"
        },
        {
            dial: "538",
            loadlbs: "243.0"
        },
        {
            dial: "539",
            loadlbs: "244.0"
        },
        {
            dial: "540",
            loadlbs: "245.0"
        },
        {
            dial: "541",
            loadlbs: "245.0"
        },
        {
            dial: "542",
            loadlbs: "246.0"
        },
        {
            dial: "543",
            loadlbs: "247.0"
        },
        {
            dial: "544",
            loadlbs: "248.0"
        },
        {
            dial: "545",
            loadlbs: "249.0"
        },
        {
            dial: "546",
            loadlbs: "249.0"
        },
        {
            dial: "547",
            loadlbs: "250.0"
        },
        {
            dial: "548",
            loadlbs: "251.0"
        },
        {
            dial: "549",
            loadlbs: "252.0"
        },
        {
            dial: "550",
            loadlbs: "252.0"
        },
        {
            dial: "551",
            loadlbs: "253.0"
        },
        {
            dial: "552",
            loadlbs: "254.0"
        },
        {
            dial: "553",
            loadlbs: "255.0"
        },
        {
            dial: "554",
            loadlbs: "256.0"
        },
        {
            dial: "555",
            loadlbs: "256.0"
        },
        {
            dial: "556",
            loadlbs: "257.0"
        },
        {
            dial: "557",
            loadlbs: "258.0"
        },
        {
            dial: "558",
            loadlbs: "259.0"
        },
        {
            dial: "559",
            loadlbs: "259.0"
        },
        {
            dial: "560",
            loadlbs: "260.0"
        },
        {
            dial: "561",
            loadlbs: "261.0"
        },
        {
            dial: "562",
            loadlbs: "262.0"
        },
        {
            dial: "563",
            loadlbs: "263.0"
        },
        {
            dial: "564",
            loadlbs: "263.0"
        },
        {
            dial: "565",
            loadlbs: "264.0"
        },
        {
            dial: "566",
            loadlbs: "265.0"
        },
        {
            dial: "567",
            loadlbs: "266.0"
        },
        {
            dial: "568",
            loadlbs: "266.0"
        },
        {
            dial: "569",
            loadlbs: "267.0"
        },
        {
            dial: "570",
            loadlbs: "268.0"
        },
        {
            dial: "571",
            loadlbs: "269.0"
        },
        {
            dial: "572",
            loadlbs: "270.0"
        },
        {
            dial: "573",
            loadlbs: "270.0"
        },
        {
            dial: "574",
            loadlbs: "271.0"
        },
        {
            dial: "575",
            loadlbs: "272.0"
        },
        {
            dial: "576",
            loadlbs: "273.0"
        },
        {
            dial: "577",
            loadlbs: "273.0"
        },
        {
            dial: "578",
            loadlbs: "274.0"
        },
        {
            dial: "579",
            loadlbs: "275.0"
        },
        {
            dial: "580",
            loadlbs: "276.0"
        },
        {
            dial: "581",
            loadlbs: "277.0"
        },
        {
            dial: "582",
            loadlbs: "277.0"
        },
        {
            dial: "583",
            loadlbs: "278.0"
        },
        {
            dial: "584",
            loadlbs: "279.0"
        },
        {
            dial: "585",
            loadlbs: "280.0"
        },
        {
            dial: "586",
            loadlbs: "280.0"
        },
        {
            dial: "587",
            loadlbs: "281.0"
        },
        {
            dial: "588",
            loadlbs: "282.0"
        },
        {
            dial: "589",
            loadlbs: "283.0"
        },
        {
            dial: "590",
            loadlbs: "284.0"
        },
        {
            dial: "591",
            loadlbs: "284.0"
        },
        {
            dial: "592",
            loadlbs: "285.0"
        },
        {
            dial: "593",
            loadlbs: "286.0"
        },
        {
            dial: "594",
            loadlbs: "287.0"
        },
        {
            dial: "595",
            loadlbs: "287.0"
        },
        {
            dial: "596",
            loadlbs: "288.0"
        },
        {
            dial: "597",
            loadlbs: "289.0"
        },
        {
            dial: "598",
            loadlbs: "290.0"
        },
        {
            dial: "599",
            loadlbs: "291.0"
        },
        {
            dial: "600",
            loadlbs: "291.0"
        },
        {
            dial: "601",
            loadlbs: "292.0"
        },
        {
            dial: "602",
            loadlbs: "293.0"
        },
        {
            dial: "603",
            loadlbs: "294.0"
        },
        {
            dial: "604",
            loadlbs: "295.0"
        },
        {
            dial: "605",
            loadlbs: "295.0"
        },
        {
            dial: "606",
            loadlbs: "296.0"
        },
        {
            dial: "607",
            loadlbs: "297.0"
        },
        {
            dial: "608",
            loadlbs: "298.0"
        },
        {
            dial: "609",
            loadlbs: "298.0"
        },
        {
            dial: "610",
            loadlbs: "299.0"
        },
        {
            dial: "611",
            loadlbs: "300.0"
        },
        {
            dial: "612",
            loadlbs: "301.0"
        },
        {
            dial: "613",
            loadlbs: "302.0"
        },
        {
            dial: "614",
            loadlbs: "302.0"
        },
        {
            dial: "615",
            loadlbs: "303.0"
        },
        {
            dial: "616",
            loadlbs: "304.0"
        },
        {
            dial: "617",
            loadlbs: "305.0"
        },
        {
            dial: "618",
            loadlbs: "305.0"
        },
        {
            dial: "619",
            loadlbs: "306.0"
        },
        {
            dial: "620",
            loadlbs: "307.0"
        },
        {
            dial: "621",
            loadlbs: "308.0"
        },
        {
            dial: "622",
            loadlbs: "309.0"
        },
        {
            dial: "623",
            loadlbs: "309.0"
        },
        {
            dial: "624",
            loadlbs: "310.0"
        },
        {
            dial: "625",
            loadlbs: "311.0"
        },
        {
            dial: "626",
            loadlbs: "312.0"
        },
        {
            dial: "627",
            loadlbs: "312.0"
        },
        {
            dial: "628",
            loadlbs: "313.0"
        },
        {
            dial: "629",
            loadlbs: "314.0"
        },
        {
            dial: "630",
            loadlbs: "315.0"
        },
        {
            dial: "631",
            loadlbs: "316.0"
        },
        {
            dial: "632",
            loadlbs: "316.0"
        },
        {
            dial: "633",
            loadlbs: "317.0"
        },
        {
            dial: "634",
            loadlbs: "318.0"
        },
        {
            dial: "635",
            loadlbs: "319.0"
        },
        {
            dial: "636",
            loadlbs: "319.0"
        },
        {
            dial: "637",
            loadlbs: "320.0"
        },
        {
            dial: "638",
            loadlbs: "321.0"
        },
        {
            dial: "639",
            loadlbs: "322.0"
        },
        {
            dial: "640",
            loadlbs: "323.0"
        },
        {
            dial: "641",
            loadlbs: "323.0"
        },
        {
            dial: "642",
            loadlbs: "324.0"
        },
        {
            dial: "643",
            loadlbs: "325.0"
        },
        {
            dial: "644",
            loadlbs: "326.0"
        },
        {
            dial: "645",
            loadlbs: "326.0"
        },
        {
            dial: "646",
            loadlbs: "327.0"
        },
        {
            dial: "647",
            loadlbs: "328.0"
        },
        {
            dial: "648",
            loadlbs: "329.0"
        },
        {
            dial: "649",
            loadlbs: "330.0"
        },
        {
            dial: "650",
            loadlbs: "330.0"
        },
        {
            dial: "651",
            loadlbs: "331.0"
        },
        {
            dial: "652",
            loadlbs: "332.0"
        },
        {
            dial: "653",
            loadlbs: "333.0"
        },
        {
            dial: "654",
            loadlbs: "333.0"
        },
        {
            dial: "655",
            loadlbs: "334.0"
        },
        {
            dial: "656",
            loadlbs: "335.0"
        },
        {
            dial: "657",
            loadlbs: "336.0"
        },
        {
            dial: "658",
            loadlbs: "337.0"
        },
        {
            dial: "659",
            loadlbs: "337.0"
        },
        {
            dial: "660",
            loadlbs: "338.0"
        },
        {
            dial: "661",
            loadlbs: "339.0"
        },
        {
            dial: "662",
            loadlbs: "340.0"
        },
        {
            dial: "663",
            loadlbs: "340.0"
        },
        {
            dial: "664",
            loadlbs: "341.0"
        },
        {
            dial: "665",
            loadlbs: "342.0"
        },
        {
            dial: "666",
            loadlbs: "343.0"
        },
        {
            dial: "667",
            loadlbs: "344.0"
        },
        {
            dial: "668",
            loadlbs: "344.0"
        },
        {
            dial: "669",
            loadlbs: "345.0"
        },
        {
            dial: "670",
            loadlbs: "346.0"
        },
        {
            dial: "671",
            loadlbs: "347.0"
        },
        {
            dial: "672",
            loadlbs: "347.0"
        },
        {
            dial: "673",
            loadlbs: "348.0"
        },
        {
            dial: "674",
            loadlbs: "349.0"
        },
        {
            dial: "675",
            loadlbs: "350.0"
        },
        {
            dial: "676",
            loadlbs: "351.0"
        },
        {
            dial: "677",
            loadlbs: "351.0"
        },
        {
            dial: "678",
            loadlbs: "352.0"
        },
        {
            dial: "679",
            loadlbs: "353.0"
        },
        {
            dial: "680",
            loadlbs: "354.0"
        },
        {
            dial: "681",
            loadlbs: "354.0"
        },
        {
            dial: "682",
            loadlbs: "355.0"
        },
        {
            dial: "683",
            loadlbs: "356.0"
        },
        {
            dial: "684",
            loadlbs: "357.0"
        },
        {
            dial: "685",
            loadlbs: "358.0"
        },
        {
            dial: "686",
            loadlbs: "358.0"
        },
        {
            dial: "687",
            loadlbs: "359.0"
        },
        {
            dial: "688",
            loadlbs: "360.0"
        },
        {
            dial: "689",
            loadlbs: "361.0"
        },
        {
            dial: "690",
            loadlbs: "361.0"
        },
        {
            dial: "691",
            loadlbs: "362.0"
        },
        {
            dial: "692",
            loadlbs: "363.0"
        },
        {
            dial: "693",
            loadlbs: "365.0"
        },
        {
            dial: "694",
            loadlbs: "365.0"
        },
        {
            dial: "695",
            loadlbs: "365.0"
        },
        {
            dial: "696",
            loadlbs: "366.0"
        },
        {
            dial: "697",
            loadlbs: "367.0"
        },
        {
            dial: "698",
            loadlbs: "368.0"
        },
        {
            dial: "699",
            loadlbs: "368.0"
        },
        {
            dial: "700",
            loadlbs: "369.0"
        },
        {
            dial: "701",
            loadlbs: "370.0"
        },
        {
            dial: "702",
            loadlbs: "371.0"
        },
        {
            dial: "703",
            loadlbs: "372.0"
        },
        {
            dial: "704",
            loadlbs: "372.0"
        },
        {
            dial: "705",
            loadlbs: "373.0"
        },
        {
            dial: "706",
            loadlbs: "374.0"
        },
        {
            dial: "707",
            loadlbs: "375.0"
        },
        {
            dial: "708",
            loadlbs: "376.0"
        },
        {
            dial: "709",
            loadlbs: "376.0"
        },
        {
            dial: "710",
            loadlbs: "377.0"
        },
        {
            dial: "711",
            loadlbs: "378.0"
        },
        {
            dial: "712",
            loadlbs: "379.0"
        },
        {
            dial: "713",
            loadlbs: "379.0"
        },
        {
            dial: "714",
            loadlbs: "380.0"
        },
        {
            dial: "715",
            loadlbs: "381.0"
        },
        {
            dial: "716",
            loadlbs: "382.0"
        },
        {
            dial: "717",
            loadlbs: "383.0"
        },
        {
            dial: "718",
            loadlbs: "383.0"
        },
        {
            dial: "719",
            loadlbs: "384.0"
        },
        {
            dial: "720",
            loadlbs: "385.0"
        },
        {
            dial: "721",
            loadlbs: "386.0"
        },
        {
            dial: "722",
            loadlbs: "386.0"
        },
        {
            dial: "723",
            loadlbs: "387.0"
        },
        {
            dial: "724",
            loadlbs: "388.0"
        },
        {
            dial: "725",
            loadlbs: "389.0"
        },
        {
            dial: "726",
            loadlbs: "390.0"
        },
        {
            dial: "727",
            loadlbs: "390.0"
        },
        {
            dial: "728",
            loadlbs: "391.0"
        },
        {
            dial: "729",
            loadlbs: "392.0"
        },
        {
            dial: "730",
            loadlbs: "393.0"
        },
        {
            dial: "731",
            loadlbs: "393.0"
        },
        {
            dial: "732",
            loadlbs: "394.0"
        },
        {
            dial: "733",
            loadlbs: "395.0"
        },
        {
            dial: "734",
            loadlbs: "396.0"
        },
        {
            dial: "735",
            loadlbs: "397.0"
        },
        {
            dial: "736",
            loadlbs: "397.0"
        },
        {
            dial: "737",
            loadlbs: "398.0"
        },
        {
            dial: "738",
            loadlbs: "399.0"
        },
        {
            dial: "739",
            loadlbs: "400.0"
        },
        {
            dial: "740",
            loadlbs: "400.0"
        },
        {
            dial: "741",
            loadlbs: "401.0"
        },
        {
            dial: "742",
            loadlbs: "402.0"
        },
        {
            dial: "743",
            loadlbs: "403.0"
        },
        {
            dial: "744",
            loadlbs: "404.0"
        },
        {
            dial: "745",
            loadlbs: "404.0"
        },
        {
            dial: "746",
            loadlbs: "405.0"
        },
        {
            dial: "747",
            loadlbs: "406.0"
        },
        {
            dial: "748",
            loadlbs: "407.0"
        },
        {
            dial: "749",
            loadlbs: "407.0"
        },
        {
            dial: "750",
            loadlbs: "408.0"
        }
    ])
}
