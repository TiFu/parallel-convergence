// LeagueCoachingHelperInterop.h
#pragma once

#include <ReplayLink/replaylink.h>

namespace LeagueCoachingHelperInterop {

	public ref class NativeProxy
	{
	public:
        NativeProxy();
        ~NativeProxy();
        !NativeProxy();

        bool Initialize();

        System::Windows::Vector GetCameraPosition();
        void SetPosition(float x, float y);

        float GetGameTime();
        void SetGameTime(float time);

        bool GetIsPaused();
        void Pause();
        void Resume();
    private:
        replay::camera* _camera_proxy;
        replay::controls* _controls_proxy;
	};
}
