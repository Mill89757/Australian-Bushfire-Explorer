class FFDI {

    constructor() {
        this.smd = null
        this.precip = null
        this.temp = null
        this.rel_hum = null
        this.wind = null
    }

    fit(daily_smd, daily_precip, daily_temp, daily_rel_hum, daily_wind) {
        /**
         * Using the soil moisture deficit calculated by either the Keetch-Byram Drought Index (KBDI) or
         * Mount's Soil Dryness Index (SDI) Holgate et al. (2017), and taking four daily weather parameters
         * outlined below, this method will calculate and return the resulting FFDI value.
         * 
         * @param daily_smd daily soil moisture deficit derived from either KBDI or SDI
         * @param daily_precip array of rainfall for past twenty days (mm)
         * @param daily_temp daily maximum temperature (C)
         * @param daily_rel_hum daily relative humidity (%)
         * @param daily_wind daily wind speed (km/h)
         * 
         * @returns FFDI value for today from the given parameters
         */
        this.smd = daily_smd
        this.precip = daily_precip
        this.temp = daily_temp
        this.rel_hum = daily_rel_hum
        this.wind = daily_wind

        var x_sig = this.calculate_most_sig_rain_event()
        var x_lim = this.calculate_x_lim()
        var drought_factor = this.griffith_drought_factor(x_sig, x_lim)
        return this.forest_fire_danger_index(drought_factor)
    }

    calculate_most_sig_rain_event() {
        /**
         * Calculates the most significant rain events as outlined by Finkele et al. (2006), Lucas (2010) 
         * and Holgate et al. (2017). By considering the "most significant" rainfall event in the past 
         * twenty days, where a rainfall event can be either a single day or a set of consecutive days each with
         * rainfall above 2mm. P is defined to be the sum of all rainfall in the event, and N is the number of days
         * since the largest daily precipitation within that same event.
         * 
         * @returns the minimum of all x calculated to be used for the calculation of the drought factor. It is also
         * the "most significant" rainfall event in the past twenty days.
         */
        var precip_array = this.precip
        var sig_rain_events = []
        var i = 0
        var j = 0
        var k = 0
        var P = 0
        var largest_rain = 0
        var largest_rain_index = 0
        var x = 0
        var x_sig = Number.POSITIVE_INFINITY
        var rain_event_P;
        var rain_event_N;

        if (precip_array.length > 20) {
            precip_array = precip_array.slice(-20)
        }
        while (i < precip_array.length) {
            P = 0
            largest_rain = 0
            if (precip_array[i] > 2) {
                P += precip_array[i]
                largest_rain = precip_array[i]
                largest_rain_index = i
                j = i + 1
                while (precip_array[j] > 2) {
                    P += precip_array[j]
                    if (precip_array[j] > largest_rain) {
                        largest_rain = precip_array[j]
                        largest_rain_index = j
                    }
                    j++
                    i++
                }
                sig_rain_events.push([P, 20 - largest_rain_index - 1])
            }
            i++
        }
        if (sig_rain_events.length == 0) {
            return 1
        } else {
            for (k = 0; k < sig_rain_events.length; k++) {
                rain_event_P = sig_rain_events[k][0]
                rain_event_N = sig_rain_events[k][1]
                x = this.calculate_x(rain_event_N, rain_event_P)
                if (x < x_sig) {
                    x_sig = x
                }
            }
            return x_sig
        }
    }

    calculate_x(N, P) {
        /**
         * The calculation of x values follows from the function that evaluates rainfall over
         * the past twenty days Finkele et al. (2006).
         * 
         * @returns x per Finkele et al. (2006) equation for drought factor
         */

        if (N >= 1 && P > 2) {
            return (Math.pow(N, 1.3) / (Math.pow(N, 1.3) + (P - 2)))
        }
        if (N = 0 && P > 2) {
            return (Math.pow(0.8, 1.3) / (Math.pow(0.8, 1.3) + (P - 2)))
        }
        if (P <=2) {
            return 1
        }
    }

    calculate_x_lim() {
        /**
         * It was founded in operational use at the Australian Bureau of Meteorology(BoM) that
         * the drought factor using the above calculations for x would increase too rapidly
         * during periods of prolonged dry climate, after a significant rain event Finkele et al. (2006).
         * They proposed a resolution by taking the minimum of x and x_lim.
         * 
         * @returns x_lim per Finkele et al. (2006) proposition.
         */
        if (this.smd < 20) {
            return (1 / (1 + 0.1135 * this.smd))
        }
        if (this.smd >= 20) {
            return (75 / (270.525 - 1.267 * this.smd))
        }
    }

    griffith_drought_factor(x_sig, x_lim) {
        /**
         * This formula is given by Griffiths (1999) and more closely approximates McArthur's meter
         * of drought than other equations such as the equation proposed by Noble et al. (1980).
         * @param smd soil moisture deficit as calculated derived from the Keetch-Byram Drought Index (KBDI)
         * @param x_sig calculation of x 
         * @param x_lim calculation of x_lim as proposed by Finkele et al. (2006)
         * 
         * @returns drought factor
         */
        var x = Math.min(x_sig, x_lim)
        var x_term = (41*x**2 + x) / (40*x**2 + x + 1)
        var other_term = 10.5 * (1 - Math.pow(Math.E, -(this.smd + 30) / 40.))
        var full_term = other_term * x_term
        var df = Math.min(full_term, 10)
        return df
    }
    
    forest_fire_danger_index(drought_factor) {
        /**
         * Using McArthur's Forest Fire Danger Index(FFDI) McArthur(1967), the FFDI is calculated
         * using the equation presented by Noble et al. (1980).
         * @param drought_factor drought factor using equation from Griffiths (1999)
         * @param rel_hum daily relative humidity (%)
         * @param temp daily maximum temperature (C)
         * @param wind daily wind speed (km/h)
         * 
         * @returns FFDI value using given parameters
         */
        var drought = 0.987 * Math.log(drought_factor)
        var humidity = 0.0345 * this.rel_hum
        var temp = 0.0338 * this.temp
        var wind = 0.0234 * this.wind
        return (2 * Math.pow(Math.E, (-0.45 + drought - humidity + temp + wind)))
    }
}
var hello = new FFDI()
console.log(hello.fit(100,[0.3,1.8,3.3,5.1,2.3,5.8,0,0,22.1,5.8,0.3,0,0,4.6,0,0,0,0,0,0],45,30,50))