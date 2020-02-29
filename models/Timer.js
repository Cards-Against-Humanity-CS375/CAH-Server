class Timer
{

  constructor(max_time)
  {
    this.max_time = max_time
    this.current_time = 0
  }

  start_time()
  {
    timer = setInterval(function () { this.current_time += 1 }, 1000);
  }
  stop_time()
  {
    clearInterval(timer);
  }

  timeout()
  {
    if (current_time >= this.max_time) {
      return true
    }
    else {
      return False
    }
  }
}

module.exports = { Timer }