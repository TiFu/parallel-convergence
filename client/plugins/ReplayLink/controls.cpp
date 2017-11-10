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

	bool controls_impl::init()
	{
		if (connect_to_league() == false)
			return false;

		std::cout << "Trying to find the pattern for the control object..." << std::endl;

		object_address = 0;
		PatternSearch pattern("\xA1\xCC\xCC\xCC\xCC\xC6\x45\xFC\x01\x8B\x70\x60");

		std::vector<ptr_t> results;
		pattern.SearchRemoteWhole(internal::league_process, true, 0xCC, results);

		// Unable to find position offset
		if (results.size() == 0)
		{
			std::cout << "Unable to find the pattern." << std::endl;
			return false;
		}

		if (internal::league_process.memory().Read<uint32_t>(results[0] + 1, object_address))
		{
			std::cout << "Failed to read a part of the pattern." << std::endl;
			return false;
		}

		internal::league_process.memory().Read<uint32_t>(object_address, object_address);

		object_address += 0x68;

		PatternSearch pattern2("\x83\xEC\x0C\x53\x8B\xD9\x80\xBB\xEC\x00\x00\x00\x00");
		pattern2.SearchRemoteWhole(internal::league_process, false, 0, results);

		if (results.size() == 0)
		{
			std::cout << "Unable to find the set time function." << std::endl;
			return false;
		}

		set_time_address = results[0];

		time_address = object_address + 0x4C;
		return true;
	}

	void controls_impl::set_time(float time)
	{
		RemoteFunctionBase<double, void*, float> set_time(internal::league_process, set_time_address, eCalligConvention::cc_thiscall);
		decltype(set_time)::CallArguments t(reinterpret_cast<void*>(object_address), time);

		set_time.Call(t);
	}

	float controls_impl::get_time()
	{
		float t_return = 0;
		internal::league_process.memory().Read<float>(time_address, t_return);

		return t_return;
	}
}

int main()
{
	replay::controls_impl t_camera;

	t_camera.init();

	t_camera.set_time(10 * 60);
}