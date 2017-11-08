// This is the main DLL file.

#include "NativeProxy.h"

using LeagueCoachingHelperInterop::NativeProxy;

NativeProxy::NativeProxy(System::IntPtr hwnd)
{
    
}

NativeProxy::~NativeProxy()
{
    this->!NativeProxy();
}

NativeProxy::!NativeProxy()
{
    delete this->_proxy_object;
}
