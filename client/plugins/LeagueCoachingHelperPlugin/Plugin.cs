
using System;
using System.Threading;
using System.Threading.Tasks;
using LeagueCoachingHelperInterop;
using Newtonsoft.Json;

namespace LeagueCoachingHelperPlugin
{
    public class Plugin
    {
        private const int PollRate = 40;

        private const float TimeTolerance = 1;

        private const float PositionTolerance = 5;
        
        private readonly NativeProxy _nativeProxy;

        private float _lastTime;

        private float _lastX;

        private float _lastY;

        private bool _lastPaused;

        private Task _cameraPollTask;

        private readonly CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();

        public Plugin()
        {
            this._nativeProxy = new NativeProxy();
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
                return;
            }

            Task.Run(() =>
            {
                if (this._nativeProxy.Initialize())
                {
                    this._cameraPollTask = this.PollState(this._cancellationTokenSource.Token);

                    callback(null);
                }
                else
                {
                    callback("initialization failed!");
                }
            });
        }

        private async Task PollState(CancellationToken cancellationToken)
        {
            var state = new GameState();
            while (!cancellationToken.IsCancellationRequested)
            {
                var position = this._nativeProxy.GetCameraPosition();
                
                state.CameraLocation = new VectorThatDoesntSuck(position);

                this._lastX = state.CameraLocation.X;
                this._lastY = state.CameraLocation.Y;

                this._lastTime = this._nativeProxy.GetGameTime();
                state.GameTime = this._lastTime;

                this._lastPaused = this._nativeProxy.GetIsPaused();
                state.IsPaused = this._lastPaused;

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
            void HandleState(GameState state)
            {
                if (Math.Abs(this._lastX - state.CameraLocation.X) > PositionTolerance ||
                    Math.Abs(this._lastY - state.CameraLocation.Y) > PositionTolerance)
                {
                    this._nativeProxy.SetPosition(state.CameraLocation.X, state.CameraLocation.Y);
                }

                if (Math.Abs(this._lastTime - state.GameTime) > TimeTolerance)
                {
                    this._nativeProxy.SetGameTime(state.GameTime);
                }

                if (this._lastPaused != state.IsPaused)
                {
                    if (state.IsPaused)
                    {
                        this._nativeProxy.Pause();
                    }
                    else
                    {
                        this._nativeProxy.Resume();
                    }
                }
                
                callback?.Invoke(null);
            }

            Task.Run(() =>
            {
                if (gameState is GameState typedGameState)
                {
                    HandleState(typedGameState);
                    return;
                }
                
                if (gameState is string gameStateString)
                {
                    var deserializedGameState = JsonConvert.DeserializeObject<GameState>(gameStateString);

                    if (deserializedGameState != null)
                    {
                        HandleState(deserializedGameState);
                        return;
                    }
                }
                
                callback?.Invoke("invalid object passed! wrong type.");
            });
        }

        public event Action<object> GameStateChanged;
    }
}
