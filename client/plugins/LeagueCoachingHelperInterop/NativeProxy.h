// LeagueCoachingHelperInterop.h

#pragma once

namespace LeagueCoachingHelperInterop {

	public ref class NativeProxy
	{
	public:
        NativeProxy(System::IntPtr hwnd);
        ~NativeProxy();
        !NativeProxy();

    private:
        /// this type should be replaced with a real object type
        void* _proxy_object;
	};
}
