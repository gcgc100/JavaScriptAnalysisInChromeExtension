const app_key = 'dfb0fee022c3ff99b63f471827cee315a8e39d07';
const url = 'https://try.count.ly';
const _eventType = 'jsonWspCall';
const _segmentation = {};

const CountlyLog = (() => {
  // init Countly the first time;
  Countly.init({
    app_key,
    url,
    debug: false, // remove on production
    interval: 500, // default 500ms
    fail_timeout: 60, // default 60 seconds
    max_events: 10, // default 10, to send in one batch
    queue_size: 1000 // max stored queues to store
  })

  const logEvent = (eventType = _eventType, segmentation = _segmentation) => {
    Countly.add_event({
      "key": "Release",
      segmentation: {
        // count: 1,
        url: eventType
      }
    });
  }


  return {
    logEvent
  }

})()
