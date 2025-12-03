
import { loadChart } from '../functions/gfkfunctions.js'


class UnconfinedCalcs {


    loadlbs(dial) {
        let lbs = 0;
        const loadchart = loadChart();
        // eslint-disable-next-line
        loadchart.map(chart => {
            if (dial === chart.dial) {
                lbs = chart.loadlbs;
            }
        })
        return lbs;
    }

    calcstrain (displacement,samplelength) {
        return (Number(Number(displacement * .001) / Number(samplelength)).toFixed(4))
    }
    calcarea (diameter,strain)  {
     
        return (Number(.25 * Math.PI * Math.pow(diameter, 2) / (1 - strain)).toFixed(4))
    }
    calcstress (lbs,area)  {
        return (Math.round((144 * lbs) / area))
    }

    getStressCurve(sample) {

   
        const unconfinedcalcs = new UnconfinedCalcs();
       
        let stresscurve = [];
        if(sample) {
        const samplelength = Number(sample.samplelength);
        const diameter = Number(sample.diameter);
       
        if(sample.unconfined && Array.isArray(sample.unconfined)) {
            // eslint-disable-next-line
            let unconfinedtest = sample.unconfined;
            unconfinedtest.map(data=> {
                const lbs = unconfinedcalcs.loadlbs(data.loadreading);
                const strain = unconfinedcalcs.calcstrain(data.displacement,samplelength)
                const area = unconfinedcalcs.calcarea(diameter,strain)
                const stress = unconfinedcalcs.calcstress(lbs,area)
                const value = {lbs, area,stress,strain}
                stresscurve.push(value)
            })


        }

    }
    return stresscurve;

    }

 

    getMaxStress(sample) {
        const unconfinedcalcs = new UnconfinedCalcs();
        const stresscurve = unconfinedcalcs.getStressCurve(sample)
        let maxstress = 0;
        if(stresscurve.length>0) {
            // eslint-disable-next-line
            stresscurve.map(value=> {
                const stress =Number(value.stress);
                if(stress > maxstress) {
                    maxstress = stress;
                }

            })
        }
       
       
        return maxstress;
    }

    getMaxStrain(sample) {
        const unconfinedcalcs = new UnconfinedCalcs();
        const maxstress = unconfinedcalcs.getMaxStress(sample)
        const stresscurve = unconfinedcalcs.getStressCurve(sample)
        let maxstrain = 0;
        if(maxstress > 0 && stresscurve.length > 0) {
            // eslint-disable-next-line
            stresscurve.map(value => {
                if(maxstress ===  Number(value.stress)) {
                    maxstrain = value.strain;
                }
            })

        }
        maxstrain = Number(maxstrain*100).toFixed(1)
        return maxstrain;
    }



}

export default UnconfinedCalcs;