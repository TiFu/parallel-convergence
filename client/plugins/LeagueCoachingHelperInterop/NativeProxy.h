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

        System::Windows::Vector GetCameraPosition();
        void SetPosition(float x, float y);
    private:
        replay::camera* _proxy_object;
	};
}
