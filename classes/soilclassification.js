class SoilClassification {

    constructor(netwgt, ll, pi, wgt34, wgt38, wgt4, wgt10, wgt30, wgt40, wgt100, wgt200) {

        this.netwgt = netwgt;
        this.ll = ll;
        this.pi = pi;
        this.wgt34 = wgt34;
        this.wgt38 = wgt38;
        this.wgt4 = wgt4;
        this.wgt10 = wgt10;
        this.wgt30 = wgt30;
        this.wgt40 = wgt40;
        this.wgt100 = wgt100;
        this.wgt200 = wgt200;
        this.gravfrac = 0;
        this.sandfrac = 0;
        this.fines = 0;
        this.cu = 0;
        this.cz = 0;
        this.d60 = 0;
        this.d30 = 0;
        this.d10 = 0;
        this.sieveanalysis = [];
        this.sieve_34 = {};
        this.message = '';
        this.classification = {};
        this.loadgradation();
        this.groupsymcalc();



    }


    aline() {
        const aline = 0.73 * (this.ll - 20);
        return aline;
    }

    interpolatexfromy(x1, y1, x2, y2, numval) {
        const value = x1 + (x2 - x1) * ((numval - y1) / (y2 - y1))
        return value;
    }

    loadgradation() {


        let wgt34 = Number(this.wgt34);
        let wgt38 = Number(this.wgt38);
        let wgt4 = Number(this.wgt4);
        let wgt10 = Number(this.wgt10);
        let wgt30 = Number(this.wgt30);
        let wgt40 = Number(this.wgt40);
        let wgt100 = Number(this.wgt100);
        let wgt200 = Number(this.wgt200);
        let netwgt = Number(this.netwgt);
        this.gravfrac = Math.round((wgt4) / (netwgt) * 100);
        this.sandfrac = Math.round((netwgt - wgt4) / (netwgt) * 100) - Math.round((netwgt - wgt200) / (netwgt) * 100);
        this.fines = Math.round((netwgt - wgt200) / (netwgt) * 100)

        let sieveanalysis = [];
        const sieve_34 = { 'wgt34': wgt34, 'opening': 19.05, 'passing': Math.round((netwgt - wgt34) / (netwgt) * 100) };
        const sieve_38 = { 'wgt38': wgt38, 'opening': 9.525, 'passing': Math.round((netwgt - wgt38) / (netwgt) * 100) };
        const sieve_4 = { 'wgt4': wgt4, 'opening': 4.75, 'passing': Math.round((netwgt - wgt4) / (netwgt) * 100) };
        const sieve_10 = { 'wgt10': wgt10, 'opening': 2, 'passing': Math.round((netwgt - wgt10) / (netwgt) * 100) };
        const sieve_30 = { 'wgt30': wgt30, 'opening': 0.6, 'passing': Math.round((netwgt - wgt30) / (netwgt) * 100) };
        const sieve_40 = { 'wgt40': wgt40, 'opening': 0.425, 'passing': Math.round((netwgt - wgt40) / (netwgt) * 100) };
        const sieve_100 = { 'wgt100': wgt100, 'opening': 0.15, 'passing': Math.round((netwgt - wgt100) / (netwgt) * 100) };
        const sieve_200 = { 'wgt200': wgt200, 'opening': 0.075, 'passing': Math.round((netwgt - wgt200) / (netwgt) * 100) }

        sieveanalysis = [sieve_34, sieve_38, sieve_4, sieve_10, sieve_30, sieve_40, sieve_100, sieve_200]
        this.sieveanalysis = sieveanalysis;

        let d60 = 0;
        let d10 = 0;
        let d30 = 0;
        let x1 = 0
        let y1 = 0
        let x2 = 0
        let y2 = 0

        if (sieveanalysis[sieveanalysis.length - 1].passing > 60) {

            d60 = sieveanalysis[sieveanalysis.length - 1].opening;

        }

        if (sieveanalysis[sieveanalysis.length - 1].passing > 30) {

            d30 = sieveanalysis[sieveanalysis.length - 1].opening;

        }

        if (sieveanalysis[sieveanalysis.length - 1].passing > 10) {

            d10 = sieveanalysis[sieveanalysis.length - 1].opening;

        }
        // eslint-disable-next-line
        sieveanalysis.map((sieve, i) => {

             x1 = sieveanalysis[i].opening;
             y1 = sieveanalysis[i].passing;

            if (sieve.passing === 60) {


                d60 = sieve.opening;


            } else if (y1 < 60 && d60 === 0) {

                x2 = sieveanalysis[i - 1].opening;
                y2 = sieveanalysis[i - 1].passing;

                d60 = this.interpolatexfromy(x1, y1, x2, y2, 60).toFixed(4)


            }

            if (sieve.passing === 30) {


                d30 = sieve.opening;


            } else if (y1 < 30 && d30 === 0) {

                let x2 = sieveanalysis[i - 1].opening;
                let y2 = sieveanalysis[i - 1].passing;

                d30 = this.interpolatexfromy(x1, y1, x2, y2, 30).toFixed(4)


            }

            if (sieve.passing === 10) {


                d10 = sieve.opening;


            } else if (y1 < 10 && d10 === 0) {



                let x2 = sieveanalysis[i - 1].opening;
                let y2 = sieveanalysis[i - 1].passing;

                d10 = this.interpolatexfromy(x1, y1, x2, y2, 10).toFixed(4)


            }








        })


        this.d60 = d60;
        this.d30 = d30;
        this.d10 = d10;

        this.cu = d60 / d10;
        this.cz = (d30 * d30) / (d60 * d10);


    }

    groupsymcalc() {

        let gravfrac = this.gravfrac;
        let sandfrac = this.sandfrac;
        let fines = this.fines;
        let pi = this.pi;
        let ll = this.ll;
        let cu = this.cu;
        let cz = this.cz;
        let grpdesc = '';
        let grpsym = '';

        if ((pi > 0 || fines < 15) && (gravfrac > 0 || sandfrac > 0 || fines > 0)) {
            if (fines < 50) {

                if (gravfrac > sandfrac) {
                    //Gravel

                    if (fines < 5) {
                        if (cz >= 1 && cz <= 3 && cu >= 4) {
                            grpsym = "GW";
                            if (sandfrac >= 15) {
                                grpdesc = "Well-graded gravel with sand";
                            } else {
                                grpdesc = "Well-graded gravel";
                            }
                        } else {
                            grpsym = "GP";
                            if (sandfrac >= 15) {
                                grpdesc = "Poorly-graded gravel with sand";
                            } else {
                                grpdesc = "Poorly-graded gravel";
                            }
                        }
                    }

                    if (fines > 12) {
                        let aline = this.aline(ll);
                        if (pi < 4 || pi < aline) {
                            grpsym = "GM";
                            if (sandfrac >= 15) {
                                grpdesc = "Silty gravel with sand ";
                            } else {
                                grpdesc = "Silty gravel";
                            }
                        }
                        if (pi > 7 && pi > aline) {
                            grpsym = "GC";
                            if (sandfrac >= 15) {
                                grpdesc = "Clayey gravel with sand ";
                            } else {
                                grpdesc = "Clayey gravel";
                            }
                        }
                    } //End if fines > 12

                    if (fines >= 5 && fines <= 12) {
                        let aline = this.aline(ll);

                        if (cu >= 4 && cz >= 1 && cz <= 3) {

                            if (pi < 4 || pi <= aline) {
                                grpsym = "GW-GM";
                                if (sandfrac >= 15) {
                                    grpdesc = "Well-graded gravel with silt and sand";
                                } else {
                                    grpdesc = "Well-graded gravel with with silt";
                                }
                            }

                            if (pi > 7 || (pi > aline && pi > 0)) {
                                grpsym = "GW-GC";
                                if (sandfrac >= 15) {
                                    grpdesc = "Well-graded gravel with sand and clay";
                                } else {
                                    grpdesc = "Well-graded gravel with clay";
                                }
                            }

                        } else {

                            if (pi < 4 || pi < aline) {
                                grpsym = "GP-GM";
                                if (sandfrac >= 15) {
                                    grpdesc = "Poorly-graded gravel with silt and sand";
                                } else {
                                    grpdesc = "Poorly-graded gravel with silt";
                                }
                            }

                            if (pi > 7 || (pi > aline && ll > 0)) {
                                grpsym = "GP-GC";
                                if (sandfrac >= 15) {
                                    grpdesc = "Poorly-graded gravel with sand and clay";
                                } else {
                                    grpdesc = "Poorly-graded gravel with clay";
                                }
                            }

                        }
                    }


                } else {
                    //sand
                    if (fines < 5) {
                        if (cz >= 1 && cz <= 3 && cu >= 6) {
                            grpsym = "SW";
                            grpdesc = "Well-graded sand ";
                        } else {
                            grpsym = "SP";
                            grpdesc = "Poorly-graded sand ";
                        }

                    }

                    if (fines > 12) {
                        let aline = this.aline(ll);
                        if (pi < 4 || pi < aline) {
                            grpsym = "SM";
                            if (gravfrac >= 15) {
                                grpdesc = "Silty sand with gravel ";
                            } else {
                                grpdesc = "Silty sand";
                            }
                        }
                        if (pi > 7 && (pi > aline && ll > 0)) {
                            grpsym = "SC";
                            if (gravfrac >= 15) {
                                grpdesc = "Clayey sand with gravel ";
                            } else {
                                grpdesc = "Clayey sand";
                            }
                        }
                    } //End if fines > 12

                    if (fines >= 5 && fines <= 12) {
                        let aline = this.aline(ll);

                        if (cu >= 4 && cz >= 1 && cz <= 3) {

                            if (pi < 4 || pi < aline) {
                                grpsym = "SW-SM";
                                if (gravfrac >= 15) {
                                    grpdesc = "Well graded sand with silt and gravel";
                                } else {
                                    grpdesc = "Well graded sand with silt";
                                }
                            }

                            if (pi > 7 || (pi > aline && ll > 0)) {
                                grpsym = "SW-SC";
                                if (gravfrac >= 15) {
                                    grpdesc = "Well-graded sand with gravel and clay";
                                } else {
                                    grpdesc = "Well-graded sand with clay";
                                }
                            }

                        } else {

                            if (pi < 4 || pi < aline) {
                                grpsym = "SP-SM";
                                if (gravfrac >= 15) {
                                    grpdesc = "Poorly-graded sand with silt and gravel";
                                } else {
                                    grpdesc = "Poorly-graded sand with silt";
                                }
                            }

                            if (pi > 7 || ((pi > aline) && ll > 0)) {
                                grpsym = "SP-SC";
                                if (gravfrac >= 15) {
                                    grpdesc = "Poorly-graded sand with gravel and clay";
                                } else {
                                    grpdesc = "Poorly-graded sand clay";
                                }
                            }

                        }
                    }


                }
            } else {
                //Silt or clay
                let aline = this.aline(ll);
                if (ll < 50) {
                    if (pi < 4 || pi < aline) {
                        grpsym = "ML";
                        if (fines <= 70) {

                            if (sandfrac >= gravfrac) {
                                if (gravfrac < 15) {
                                    grpdesc = "Sandy silt";
                                } else {
                                    grpdesc = "Sandy silt with gravel";
                                }
                            } else {
                                if (sandfrac < 15) {
                                    grpdesc = "Gravelly silt";
                                } else {
                                    grpdesc = "Gravelly silt with sand";
                                }
                            }

                        } else {

                            if (fines > 85) {
                                grpdesc = "Silty";
                            } else {
                                if (sandfrac > gravfrac) {
                                    grpdesc = "Silt with sand";
                                } else {
                                    grpdesc = "Silt with gravel";
                                }
                            }
                        }
                    } //End of ML
                    if (pi > 7 || (pi > aline && ll > 0)) {
                        grpsym = "CL";
                        if (fines <= 70) {

                            if (sandfrac >= gravfrac) {
                                if (gravfrac < 15) {
                                    grpdesc = "Sandy lean clay";
                                } else {
                                    grpdesc = "Sandy lean clay with gravel";
                                }
                            } else {
                                if (sandfrac < 15) {

                                    grpdesc = "Gravelly lean clay";
                                } else {
                                    grpdesc = "Gravelly lean with sand";
                                }
                            }

                        } else {

                            if (fines > 85) {
                                grpdesc = "Lean clay";
                            } else {
                                if (sandfrac > gravfrac) {
                                    grpdesc = "Lean clay with sand";
                                } else {
                                    grpdesc = "Lean clay with gravel";
                                }
                            }
                        }

                    } // End of CL

                    if (pi >= 4 && pi <= 7 && pi > aline) {
                        grpsym = "CL 2 ML";
                        if (fines <= 70) {

                            if (sandfrac >= gravfrac) {
                                if (gravfrac < 15) {
                                    grpdesc = "Sandy silty clay";
                                } else {
                                    grpdesc = "Sandy silty clay with gravel";
                                }
                            } else {
                                if (sandfrac < 15) {
                                    grpdesc = "Gravelly silty clay";
                                } else {
                                    grpdesc = "Gravelly silty clay with sand";
                                }
                            }

                        } else {

                            if (fines > 85) {
                                grpdesc = "Silty clay";
                            } else {
                                if (sandfrac > gravfrac) {
                                    grpdesc = "Silty clay with sand";
                                } else {
                                    grpdesc = "Silty clay with gravel";
                                }
                            }
                        }
                    }//End of silty clay
                } else {


                    //fat clay
                    grpsym = "CH";
                    if (fines <= 70) {

                        if (sandfrac >= gravfrac) {
                            if (gravfrac < 15) {
                                grpdesc = "Sandy fat clay";
                            } else {
                                grpdesc = "Sandy fat clay with gravel";
                            }
                        } else {
                            if (sandfrac < 15) {
                                grpdesc = "Gravelly fat clay";
                            } else {
                                grpdesc = "Gravelly fat clay with sand";
                            }
                        }

                    } else {

                        if (fines > 85) {
                            grpdesc = "Fat clay";
                        } else {
                            if (sandfrac > gravfrac) {
                                grpdesc = "Fat clay with sand";
                            } else {
                                grpdesc = "Fat clay with gravel";
                            }
                        }
                    }
                }

            }// End of clay

            this.classification = { 'wgt200': this.wgt200, 'netwgt': this.netwgt, 'fines': this.fines, 'uscs': grpsym, 'classification': grpdesc }

        }



    }// End of function

    getGradationValues() {

        return ({ d60: this.d60, d30: this.d30, d10: this.d10, cu: this.cu, cz: this.cz })
    }

    getGravFrac() {
        return this.gravfrac

    }

    getSandFrac() {
        return this.sandfrac

    }

    getFines() {

        return this.fines
    }
    getSieveAnalysis() {

        return this.sieveanalysis;

    }

    getSieve_34() {

        return this.sieve_34.opening


    }
    getMessage() {
        return (this.message);

    }

    getClassification() {

        return this.classification


    }


}

export default SoilClassification;