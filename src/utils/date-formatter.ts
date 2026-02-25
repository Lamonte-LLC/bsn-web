import moment from 'moment';

moment.updateLocale('es', {
  monthsShort: 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_'),
  weekdaysShort: 'dom_lun_mar_mié_jue_vie_sáb'.split('_'),
});

export const formatDate = (
  date: string | Date = new Date(),
  format: string = 'DD/MM/YYYY',
) => {
  return moment(date).format(format);
};
