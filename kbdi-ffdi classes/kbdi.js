class KBDI {

    constructor() {
        this.temp = null
        this.precip = null

        this.prev_KBDI = null
        this.curr_KBDI = null

        this.annual_rainfall_array = []
        this.mean_annual_rainfall = null
        this.net_rainfall = 0
    }

    fit(daily_temp, daily_precip) {
        /**
         * Taking in daily temperature and rainfall as parameters, using the KBDI as a representive measure for
         * soil moisture deficit (SMD), a measure for the dryness of soil and the degree of drought
         * is obtained Lucas (2010). 
         * 
         * @param daily_temp daily maximum temperature (C)
         * @param daily_precip daily rainfall (mm)
         */
        var mean_rainfall = 0
        var p_eff = 0
        var prev_KBDI = 0
        var kbdi = 0

        this.set_temp(daily_temp)
        this.set_precip(daily_precip)

        mean_rainfall = this.calculate_mean_annual_rainfall()
        p_eff = this.calculate_P_eff(this.annual_rainfall_array)
        prev_KBDI = this.get_prev_KBDI()
        
        this.set_mean_annual_rainfall(mean_rainfall)
        this.set_net_rainfall(p_eff)
        kbdi = this.calculate_KBDI(this.get_temp(), prev_KBDI)
        this.set_KBDI(kbdi)
    }

    set_temp(new_temp) {
        /**
         * setter method to assign global temp value to be the temperature given as a parameter
         * 
         * @param new_temp daily maximum temperature (C)
         */
        this.temp = new_temp
    }

    get_temp() {
        /**
         * the getter method for the current temperature
         * 
         * @returns temp attribute
         */
        return this.temp
    }

    set_precip(new_precip) {
        /**
         * Setting the precip attribute to be a given parameter value new_precip. Additionally, 
         * it is added to the annual rainfall array to be used for calculations of effective
         * precipitation and mean annual rainfall.
         * 
         * @param new_precip daily precipitation/rainfall (mm)
         */
        this.precip = new_precip
        this.annual_rainfall_array.push(this.precip)
        if (this.annual_rainfall_array.length > 365) {
            this.annual_rainfall_array.slice(-365)
        }
        this.mean_annual_rainfall = this.calculate_mean_annual_rainfall()
    }

    get_prev_KBDI() {
        /**
         * getter method for the previous KBDI. If uninitialised, it will return value 0.
         * 
         * @returns previous KBDI value
         */
        if (this.prev_KBDI == null) {
            this.prev_KBDI = 0
        }
        return this.prev_KBDI
    }

    set_init_KBDI(drought_index) {
        /**
         * initialises the first KBDI to be the given drought index
         * 
         * @param drought_index the initial drought index
         */
        this.prev_KBDI = drought_index
    }

    set_KBDI(new_KBDI) {
        /**
         * setter method for a new KBDI, setting the previous KBDI to the current KBDI,
         * and setting the new KBDI to be the current KBDI
         * 
         * @param new_KBDI the new KBDI value that will be the current KBDI value
         * 
         */
        this.prev_KBDI = this.curr_KBDI
        this.curr_KBDI = new_KBDI
    }

    get_KBDI() {
        /**
         * getter method for the current KBDI value
         * 
         * @returns current KBDI
         */
        return this.curr_KBDI
    }

    initialise_KBDI(init_temp_array, init_rainfall_array, init_drought_index = 0) {
        /**
         * Daily SMD value is a recurrence relation on the previous days' SMD value.
         * Careful consideration should be placed as Keetch and Byram (1968) state that
         * the drought index cannot begin from zero but on a day with high probability 
         * the upper soil layers are saturated.
         * 
         * Keetch and Byram (1968), mentions that to start the calculation of KBDI for 
         * a given region, it needs to begin calculations when the KBDI value was 0, where
         * the soil was saturated by water. They state this to be the day after a rainy period
         * with 150 to 200 mm rainfall in a 7 day period.
         * 
         * If there is insufficient data and/or limitations in obtaining the period where it is
         * reasonably certain the soil is saturated by water, KBDI is initialised to 0, and 
         * a buffer period is used to calculate the KBDI to better reflect the soil saturation 
         * levels for a given region, before initial KBDI values are generated for use.
         * 
         * @param init_temp_array initial array of temperature data
         * @param init_rainfall_array initial array of rainfall data
         * @param init_drought_index defaulted to 0
         */
        var i = 0
        var x = init_rainfall_array.length
        if ( x > init_temp_array.length) {
            x = init_temp_array.length
        }

        this.set_init_KBDI(init_drought_index)

        for (i = 0; i < x; i ++) {
            this.fit(init_temp_array[i], init_rainfall_array[i])
        }
    }

    get_annual_rainfall_array() {
        /**
         * getter method for the annual rainfall array
         * 
         * @returns annual rainfall array attribute
         */
        return this.annual_rainfall_array
    }

    calculate_KBDI(prev_temp, prev_KBDI) {
        /**
         * Soil moisture balance is a recurrence relation of the previous day's soil 
         * moisture balance and the difference between the amount of water leaving the soil
         * via evaporation and transpiration, evapotranspiration, and the amount of water
         * infiltrating the soil, effective precipitation.
         * 
         * @param prev_temp daily maximum temperature (C)
         * @param prev_KBDI KBDI value for yesterday
         * 
         * @returns KBDI value 
         */
        if (prev_KBDI == null) {
            prev_KBDI = this.get_prev_KBDI()
        }
        return this.get_prev_KBDI() + this.calculate_ET(prev_temp, prev_KBDI) + this.get_net_rainfall()
    }

    set_mean_annual_rainfall(amount) {
        /**
         * setting the mean annual rainfall to be the given value amount
         * 
         * @param amount amount of mean annual rainfall for the past 365 days (mm)
         */
        this.mean_annual_rainfall = amount
    }

    get_mean_annual_rainfall() {
        /**
         * getter method for the mean annual rainfall (mm)
         * 
         * @returns mean annual rainfall attribute
         */
        return this.mean_annual_rainfall
    }

    set_net_rainfall(amount) {
        /**
         * setting net_rainfall to be the given value amount
         * 
         * @param amount amount of net rainfall for the current day
         */
        this.net_rainfall = amount
    }

    get_net_rainfall() {
        /**
         * getter method for the net rainfall. Net rainfall is defined to be the effective precipitation
         * for the current day.
         * 
         * @returns net rainfall attribute
         */
        return this.net_rainfall
    }

    calculate_mean_annual_rainfall() {
        /**
         * Takes the average of all rainfall values for the past 365 days (a year) at most.
         * Averages rainfall for past x days, where x < 365, if there is insufficient rainfall
         * data for a year's worth.
         * 
         * @param precip_array array of rainfall values for the past 365 days 
         * 
         * @returns mean annual rainfall
         */
        var i = 0
        var precip_array = this.get_annual_rainfall_array()
        var mean_rain = 0
        if (precip_array.length > 365) {
            precip_array.slice(-365)
        }
        mean_rain = 0
        for (i = 0; i < precip_array.length; i++) {
            mean_rain += precip_array[i]
        }
        mean_rain /= precip_array.length
        return mean_rain
    }

    calculate_ET(prev_temp, prev_KBDI) {
        /**
         * As outlined by Keech and Byram (1968), the amount of water leaving 
         * the soil through means of evaporation and transpiration, called, 
         * evapotranspiration, is calculated and to be used in calculating the
         * soil mositure deficit using the KBDI measure.
         * 
         * @param prev_temp daily temperature (C)
         * @param prev_temp KBDI value of yesterday
         * @param mean_annual_rainfall average annual precipitation
         * 
         * @returns ET value from given parameters
         */
        var numerator = (203.2 - prev_KBDI) * (0.968 * Math.exp(0.0875 * prev_temp + 1.5552) - 8.30)
        var denominator = 1 + 10.88 * Math.exp(-0.001736 * this.get_mean_annual_rainfall())
        return (0.001 * (numerator / denominator))
    }

    calculate_P_eff(precip_array) {
        /**
         * P eff is defined to be effective precipitation and is a term used to
         * calculate soil moisture deficit. It is defined to be the daily precipitation,
         * decreased by a certain amount that accounts for interception by vegetation cover
         * and/or runoff. Finkele et al. (2006), Lucas (2010), and Holgate et al. (2017) all use
         * 5.08mm as the threshold for the approximation of interception and/or runoff whereas, 
         * Keetch and Byram (1968) uses 5.08mm. Keetch and Byram's interpretation is used.
         * 
         * @param precip_array array of rainfall data for the days leading up to and including today
         * 
         * @returns effective precipitation
         */
        const threshold = 5.08
        var running_total = 0
        var i = precip_array.length - 1
        var no_rainfall = 1
        while (no_rainfall  && i >= 0) {
            if (precip_array[i] > 0.2) {
                running_total += precip_array[i] - 0.2
                i = i - 1
            } else {
                no_rainfall = 0
            }
        }
        running_total = running_total - threshold
        if (running_total <= 0) {
            running_total = 0
        }
        if (running_total > 0 && this.get_net_rainfall() > 0) {
            return precip_array[precip_array.length - 1] - 0.2
        } else {
            return running_total
        }
    }
}

var hello = new KBDI()
var temp_array = [19.5, 26.0, 29.4, 29.5, 12.7, 12.6, 17.2, 16.9, 16.7, 19.4, 16.0, 25.5, 16.6, 22.7, 24.8, 18.2, 19.2, 15.2, 15.5]
var rain_array = [1.8, 0, 0, 0, 12.8, 1.0, 3.2, 5.4, 1.2, 0, 0, 0, 0.2, 0, 0, 1.4, 8.4, 0.2, 0]
hello.initialise_KBDI(temp_array, rain_array)
hello.fit(25, 3.8)
console.log(hello.get_KBDI())