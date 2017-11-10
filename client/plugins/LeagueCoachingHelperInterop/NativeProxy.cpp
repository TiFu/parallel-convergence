// This is the main DLL file.

#include <cstdlib>

#include "NativeProxy.h"

using LeagueCoachingHelperInterop::NativeProxy;

NativeProxy::NativeProxy()
{
    this->_proxy_object = new replay::camera_impl;
}

NativeProxy::~NativeProxy()
{
    this->!NativeProxy();
}

NativeProxy::!NativeProxy()
{
    delete this->_proxy_object;
}

bool NativeProxy::Initialize()
{
    return this->_proxy_object->init();
}

System::Windows::Vector NativeProxy::GetCameraPosition()
{
    auto vec = this->_proxy_object->get_position();

    //auto vec = replay::vector2(rand() % 1000, rand() % 1000);

    System::Windows::Vector ret(vec.x, vec.y);

    return ret;
}

void NativeProxy::SetPosition(float x, float y)
{
    this->_proxy_object->set_position(x, y);
}

float NativeProxy::GetGameTime()
{
    return 50;
}

void NativeProxy::SetGameTime(float time)
{
    
}
