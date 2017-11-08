
using System;
using System.Threading.Tasks;

namespace LeagueCoachingHelperPlugin
{
    public class Plugin
    {
        private readonly IntPtr _hwnd;

        public Plugin(IntPtr hwnd)
        {
            _hwnd = hwnd;
        }

        /// <summary>
        /// Initialize the plugin
        /// </summary>
        /// <param name="callback">
        /// callback function, returning null on success and and error message on failure
        /// </param>
        public void Initialize(Action<object> callback)
        {
            if (callback == null)
            {
                this.InitializedEvent?.Invoke("no initialize callback provided!!");
                return;
            }

            Task.Run(() =>
            {
                callback(null);
                this.InitializedEvent?.Invoke(null);
            });
        }

        /// <summary>
        /// Example event. We probably wont use this ever.
        /// </summary>
        public event Action<object> InitializedEvent;
    }
}
