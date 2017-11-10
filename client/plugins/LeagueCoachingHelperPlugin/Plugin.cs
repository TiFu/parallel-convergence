
using System;
using System.Threading;
using System.Threading.Tasks;
using LeagueCoachingHelperInterop;

namespace LeagueCoachingHelperPlugin
{
    public class Plugin
    {
        private const int PollRate = 40;
        
        private NativeProxy _nativeProxy;

        private Task _cameraPollTask;

        private readonly CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();

        public Plugin()
        {
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
                this._nativeProxy = new NativeProxy();

                this._cameraPollTask = this.PollCamera(this._cancellationTokenSource.Token);

                callback(null);
                this.InitializedEvent?.Invoke(null);
            });
        }

        private async Task PollCamera(CancellationToken cancellationToken)
        {
            var state = new GameState();
            while (!cancellationToken.IsCancellationRequested)
            {
                var position = this._nativeProxy.GetCameraPosition();

                state.CameraLocation = new VectorThatDoesntSuck(position);

                this.GameStateChanged?.Invoke(state);

                try
                {
                    await Task.Delay(PollRate, cancellationToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        public void SetState(object gameState, Action<object> callback)
        {
            Task.Run(() =>
            {
                if (gameState is GameState typedGameState)
                {
                    this._nativeProxy.SetPosition(typedGameState.CameraLocation.X, typedGameState.CameraLocation.Y);
                    callback?.Invoke(null);
                }
                else
                {
                    callback?.Invoke("invalid object passed");
                }
            });
        }

        public event Action<object> GameStateChanged;

        /// <summary>
        /// Example event. We probably wont use this ever.
        /// </summary>
        public event Action<object> InitializedEvent;
    }
}
