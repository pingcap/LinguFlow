import dayjs from 'dayjs'

export const getDateTime = (unixTS?: number) => {
  if (!unixTS) {
    return ''
  }

  const timeFromNow = dayjs.unix(unixTS).fromNow()
  return `${dayjs.unix(unixTS).format('MMM D, YYYY HH:mm')} (${timeFromNow})`
}
