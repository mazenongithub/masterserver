export function validateEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());
}

export function formatDateExp(dateExp) { 
    const date = new Date(dateExp); 
    return new Intl.DateTimeFormat('en-US', { 
        timeZone: 'America/Los_Angeles', 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hourCycle: 'h23'}).format(date); 
}

export function xmlEscape (value) {
      if (value === null || value === undefined) return '';

      return String(value)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

export function measuredNumber (value) {
      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    };

export function hasMeasuredSieve(sieve) {
      if (
        !sieve ||
        typeof sieve !== 'object' ||
        Array.isArray(sieve)
      ) {
        return false;
      }

      const numbers = BORING_LOG_SIEVE_FIELDS
        .map(field => measuredNumber(sieve[field]))
        .filter(number => number !== null);

      return (
        numbers.length > 0 &&
        numbers.every(number => number >= 0) &&
        (
          numbers.some(number => number > 0) ||
          sieve.isComplete === true
        )
      );
    };

  export function calculateSampleMeasurements(sample) {

      const tare = measuredNumber(sample.tarewgt);

      const wetOriginal = measuredNumber(sample.wetwgt);

      const wetSplit = [
        sample.wetwgt_2,
        sample.wet_wgt2,
        sample.wet_wgt_2
      ]
        .map(measuredNumber)
        .find(number => number !== null && number > 0) ?? null;

      const dryMeasured = measuredNumber(sample.drywgt);

      const diameter = measuredNumber(sample.diameter);

      const sampleLength = measuredNumber(sample.samplelength);

      let moistureRatio = null;
      let dryMassGrams = null;

      const isSplit = wetSplit !== null && wetSplit > 0;

      if (
        tare !== null &&
        tare >= 0 &&
        dryMeasured !== null &&
        dryMeasured > tare
      ) {

        const dryMoistureMass = dryMeasured - tare;

        if (isSplit) {

          // Split sample:
          // Calculate moisture from the second wet weighing.

          if (wetSplit >= dryMeasured) {

            moistureRatio =
              (wetSplit - dryMeasured) / dryMoistureMass;

            // Back-calculate original dry mass using
            // the moisture measured from the split sample.

            if (
              wetOriginal !== null &&
              wetOriginal > tare
            ) {

              dryMassGrams =
                (wetOriginal - tare) / (1 + moistureRatio);

            }
          }

        } else {

          // Normal sample:
          // Determine dry mass directly.

          dryMassGrams = dryMoistureMass;

          if (
            wetOriginal !== null &&
            wetOriginal >= dryMeasured
          ) {

            moistureRatio =
              (wetOriginal - dryMeasured) / dryMoistureMass;

          }
        }
      }

      //
      // DRY DENSITY (PCF)
      //

      let drydensity = '';

      if (
        dryMassGrams !== null &&
        dryMassGrams > 0 &&
        diameter !== null &&
        diameter > 0 &&
        sampleLength !== null &&
        sampleLength > 0
      ) {

        const volumeIn3 =
          (Math.PI / 4) *
          Math.pow(diameter, 2) *
          sampleLength;

        const pcf =
          (dryMassGrams / 453.59237) *
          (1728 / volumeIn3);

        if (
          Number.isFinite(pcf) &&
          pcf > 0
        ) {
          drydensity = String(Math.round(pcf));
        }
      }

      //
      // MOISTURE CONTENT (%)
      //

      const moisturecontent =
        moistureRatio !== null &&
          Number.isFinite(moistureRatio) &&
          moistureRatio >= 0
          ? (moistureRatio * 100).toFixed(1)
          : '';

      return {
        drydensity,
        moisturecontent
      };
    }

