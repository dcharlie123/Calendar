;
(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS、CMD规范检查
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD规范检查
        define(factory);
    } else {
        // 浏览器注册全局对象
        global.Calendar = factory();
    }
})(this, (function () {
    function Calendar(dom, options = {}) {
        this.dom = dom;
        this.options = options;
        this.init();
    }
    Calendar.prototype = {
        init: function () {
            optionDefault = {
                year: null,
                month: null,
                startDate: null,
                endDate: null,
            };
            this.extend(this.options, optionDefault);
            var d = this.render();
            document.getElementById(this.dom).appendChild(d.$wrapper);
            var _this = this;
            d.$wrapper.addEventListener('click', function (e) {
                var $target = e.target;
                if (!$target.classList.contains('ui-datepicker-btn')) return;
                if ($target.classList.contains('ui-datepicker-prev-btn')) {
                    _this.render('prev')
                } else if ($target.classList.contains('ui-datepicker-next-btn')) {
                    _this.render('next')
                }
            }, false)
        },
        buildUi: function () {
            var monthData = this.getMonthData();
            var bodyHtml = '';
            for (var i = 0; i < (monthData.days.length / 7); i++) {
                var td = '';
                for (var j = 0; j < 7; j++) {
                    td += `<td class="${monthData.days[j + (7 * i)].isNotCurrentMonth?'notCurrentMonth':''} ${monthData.days[j + (7 * i)].inRange?'in':''} ${(monthData.days[j + (7 * i)].isToday)?'today':''}" data-date="${monthData.days[j + (7 * i)].date}">${monthData.days[j + (7 * i)].date}</td>`
                }
                bodyHtml += `<tr>${td}</tr>`;
            }
            var html = `
                    <div class="ui-datepicker-header">
                        <a href="#" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</a>
                        <a href="#" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>
                        <span class="ui-datepicker-curr-month">${this.options.year}-${this.options.month}</span>
                    </div>
                    <div class="ui-datepicker-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>一</th>
                                    <th>二</th>
                                    <th>三</th>
                                    <th>四</th>
                                    <th>五</th>
                                    <th>六</th>
                                    <th>日</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bodyHtml}
                            </tbody>
                        </table>
                    </div>`;
            return {
                html: html
            };
        },
        getMonthData: function () {
            var ret = [];
            if (!this.options.year && !this.options.month) { //如果没有传入year，month
                var today = new Date();
                this.options.year = today.getFullYear();
                this.options.month = today.getMonth() + 1;
            }
            //获取该月份的第一天
            var firstDay = new Date(this.options.year, this.options.month - 1, 1);
            //获取该月份的年和月
            this.options.year = firstDay.getFullYear();
            this.options.month = firstDay.getMonth() + 1;
            //获取该月第一天是星期几
            var firstDayWeekDay = firstDay.getDay();
            //矫正周日，在js里0是周日
            if (firstDayWeekDay === 0) {
                firstDayWeekDay = 7;
            }
            //获取上个月的最后一天是几号
            var lastDayOfLastMonth = new Date(this.options.year, this.options.month - 1, 0);
            var lastDateOfLastMonth = lastDayOfLastMonth.getDate();
            //获取需要显示上个月多少天
            var preMonthDayCount = firstDayWeekDay - 1;
            //获取本月最后一天是几号，
            var lastDay = new Date(this.options.year, this.options.month, 0);
            var lastDate = lastDay.getDate();
            //获取最后一天星期几
            var lastDayWeekDay = lastDay.getDay();
            if (lastDayWeekDay === 0) {
                lastDayWeekDay = 7;
            }
            //计算需要展示几天
            var MonthtotalShow = preMonthDayCount + lastDate + (7 - lastDayWeekDay);
            for (var i = 1; i <= MonthtotalShow; i++) {
                var date, thisMonth = this.options.month,
                    thisYear = this.options.year,
                    isNotCurrentMonth = false,
                    inRange = false,
                    isToday = false;
                date = i - preMonthDayCount;
                if (i <= preMonthDayCount) {
                    thisMonth = this.options.month - 1;
                    date = lastDateOfLastMonth + i - preMonthDayCount;
                    isNotCurrentMonth = true;
                } else if (i > (lastDate + preMonthDayCount)) {
                    thisMonth = this.options.month + 1;
                    date = date - lastDate;
                    isNotCurrentMonth = true
                }
                if (thisMonth === 0) thisMonth = 12, thisYear = thisYear - 1;
                if (thisMonth === 13) thisMonth = 1, thisYear = thisYear + 1;

                if (this.options.range && this.options.range.startDate && this.options.range.endDate) {
                    if (new Date(`${thisYear}-${thisMonth}-${date<10?('0'+date):date}`).getTime() >= new Date(this.options.range.startDate).getTime() && new Date(`${thisYear}-${thisMonth}-${date<10?('0'+date):date}`).getTime() <= new Date(this.options.range.endDate).getTime()) {
                        inRange = true
                    }
                }
                if (new Date(`${thisYear}-${thisMonth}-${date<10?('0'+date):date}`).getTime() == getTodayTime()) {
                    // date = '今天';
                    isToday = true;
                }
                ret.push({
                    year: thisYear,
                    month: thisMonth,
                    date: date,
                    isNotCurrentMonth,
                    inRange,
                    isToday
                })
            }

            function getTodayTime() {
                var _today = new Date();
                var today_year = _today.getFullYear(),
                    today_Month = _today.getMonth() + 1,
                    today_Date = _today.getDate();
                var today = new Date(today_year + "-" + today_Month + "-" + today_Date);
                return today.getTime();
            }
            return {
                days: ret
            };
        },
        render: function (direction) {
            if (direction === 'prev') {
                this.options.month--;
            }
            if (direction === 'next') {
                this.options.month++;
            }
            var D = this.buildUi();
            var $wrapperDom = '#' + this.dom + '>' + '.ui-datepicker-wrapper';
            $wrapper = document.querySelector($wrapperDom);
            if (!$wrapper) {
                var $wrapper = document.createElement('div');
                $wrapper.className = $wrapper.class = 'ui-datepicker-wrapper';
            }
            $wrapper.innerHTML = D.html;
            return {
                $wrapper: $wrapper
            }
        },
        extend: function (options, tag) {
            for (var i in tag) {
                if (!(i in options)) {
                    options[i] = tag[i];
                }
            }
            return this;
        }
    };
    return Calendar
}));