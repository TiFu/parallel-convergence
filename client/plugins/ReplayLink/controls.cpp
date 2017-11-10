#include "replaylink.h"
#include "league.h"

#include <iostream>
#include <chrono>
#include <thread>

#include <../Patterns/PatternSearch.h>
#include <../Process/Process.h>
#include <../Process/RPC/RemoteFunction.hpp>

using namespace blackbone;
using namespace std::chrono_literals;

namespace replay
{
	controls_impl::controls_impl()
	{

	}

	RemoteFunctionBase<double, void*, float>* set_time_func;

	bool controls_impl::init()
	{
		if (connect_to_league() == false)
			return false;

		// std::cout << "Trying to find the pattern for the control object..." << std::endl;

		replay_object_address = 0;
		PatternSearch pattern("\xA1\xCC\xCC\xCC\xCC\xC6\x45\xFC\x01\x8B\x70\x60");

		std::vector<ptr_t> results;
		pattern.SearchRemoteWhole(internal::league_process, true, 0xCC, results);

		// Unable to find position offset
		if (results.size() == 0)
		{
			// std::cout << "Unable to find the pattern." << std::endl;
			return false;
		}

		if (internal::league_process.memory().Read<uint32_t>(results[0] + 1, replay_object_address))
		{
			// std::cout << "Failed to read a part of the pattern." << std::endl;
			return false;
		}

		internal::league_process.memory().Read<uint32_t>(replay_object_address, replay_object_address);

		multiplayer_object_address = replay_object_address;
		replay_object_address += 0x68;

		results.clear();
		PatternSearch set_time_pattern("\x83\xEC\x0C\x53\x8B\xD9\x80\xBB\xEC\x00\x00\x00\x00");
		set_time_pattern.SearchRemoteWhole(internal::league_process, false, 0, results);

		if (results.size() == 0)
		{
			// std::cout << "Unable to find the set time function." << std::endl;
			return false;
		}

		set_time_address = results[0];

		time_address = replay_object_address + 0x4C;

		if (set_time_func != nullptr)
			delete set_time_func;
		set_time_func = new RemoteFunctionBase<double, void*, float>(internal::league_process, set_time_address, eCalligConvention::cc_thiscall);

		results.clear();
		PatternSearch set_camera_speed_pattern("\xE8\xCC\xCC\xCC\xCC\x84\xC0\x74\x0B\x80\x7C\x24\x08\x00");
		set_camera_speed_pattern.SearchRemoteWhole(internal::league_process, true, 0xCC, results);

		if (results.size() == 0)
		{
			// std::cout << "Unable to find the set time function." << std::endl;
			return false;
		}

		set_camera_speed = results[0];

		results.clear();
		PatternSearch pause_game_pattern("\x8B\x0D\xCC\xCC\xCC\xCC\x83\xF8\x02\x0F\x94");
		pause_game_pattern.SearchRemoteWhole(internal::league_process, true, 0xCC, results);

		if (results.size() == 0)
		{
			// std::cout << "Unable to find the set time function." << std::endl;
			return false;
		}

		internal::league_process.memory().Read<uint32_t>(results[0] + 2, pause_game);
		internal::league_process.memory().Read<uint32_t>(pause_game, pause_game);
		internal::league_process.memory().Read<uint32_t>(pause_game + 0x4, pause_game);
		internal::league_process.memory().Read<uint32_t>(pause_game + 0x30, pause_game);

		return true;
	}

	void controls_impl::set_time(float time)
	{
		RemoteFunctionBase<double, void*, float>::CallArguments t(reinterpret_cast<void*>(replay_object_address), time);
		set_time_func->Call(t);
	}

	void controls_impl::pause()
	{
		internal::league_process.memory().Write<bool>(pause_game + 0x78, true);
	}

	void controls_impl::resume()
	{
		internal::league_process.memory().Write<bool>(pause_game + 0x78, false);
	}

	bool controls_impl::get_is_paused()
	{
		bool t_result;
		internal::league_process.memory().Read<bool>(pause_game + 0x78, t_result);
		return t_result;
	}

	void controls_impl::set_speed(float speed)	
	{
		RemoteFunctionBase<void, void*, float, float> set_speed(internal::league_process, set_camera_speed, eCalligConvention::cc_thiscall);
		RemoteFunctionBase<void, void*, float, float>::CallArguments t(reinterpret_cast<void*>(replay_object_address), speed, 0.0f);
		set_speed.Call(t);
	}

	float controls_impl::get_time()
	{
		float t_return = 0;
		internal::league_process.memory().Read<float>(time_address, t_return);

		return t_return;
	}

    bool controls_impl::get_is_paused()
    {
        return false;
    }

    void controls_impl::pause()
    {
        
    }

    void controls_impl::resume()
    {
        
    }
}

int main()
{
	replay::controls_impl t_camera;

	t_camera.init();

	t_camera.set_pause(1);
}