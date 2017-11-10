// This is the main DLL file.

#include <cstdlib>

#include "NativeProxy.h"

using LeagueCoachingHelperInterop::NativeProxy;

NativeProxy::NativeProxy()
{
    this->_camera_proxy = new replay::camera_impl;
    this->_controls_proxy = new replay::controls_impl;
}

NativeProxy::~NativeProxy()
{
    this->!NativeProxy();
}

NativeProxy::!NativeProxy()
{
    delete this->_camera_proxy;
    delete this->_controls_proxy;
}

bool NativeProxy::Initialize()
{
    return this->_camera_proxy->init() && this->_controls_proxy->init();
}

System::Windows::Vector NativeProxy::GetCameraPosition()
{
    auto vec = this->_camera_proxy->get_position();

    System::Windows::Vector ret(vec.x, vec.y);

    return ret;
}

void NativeProxy::SetPosition(float x, float y)
{
    this->_camera_proxy->set_position(x, y);
}

float NativeProxy::GetGameTime()
{
    return this->_controls_proxy->get_time();
}

void NativeProxy::SetGameTime(float time)
{
    this->_controls_proxy->set_time(time);
}

bool NativeProxy::GetIsPaused()
{
    return this->_controls_proxy->get_is_paused();
}

void NativeProxy::Pause()
{
    this->_controls_proxy->pause();
}

void NativeProxy::Resume()
{
    this->_controls_proxy->resume();
}
